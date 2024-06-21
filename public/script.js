document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');
  const generateBtn = document.getElementById('generateBtn');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const loadingIndicator = document.getElementById('loading');
  const imageCard = document.getElementById('imageCard');

  let swiper; // Declare swiper instance globally

  // Initialize Swiper for the image cards
  swiper = new Swiper('#swiperContainer', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // Event listener for theme toggle
  themeToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark', themeToggle.checked);
  });

  // Event listener for Generate button click
  generateBtn.addEventListener('click', function () {
    generateImage();
  });

  // Event listener for Regenerate button click
  regenerateBtn.addEventListener('click', function () {
    regenerateImage();
  });

  // Function to generate images based on user inputs
  async function generateImage() {
    const prompt = document.getElementById('text').value;
    const sizeButtons = document.querySelectorAll('.size-btn');
    const styleButtons = document.querySelectorAll('.style-btn');
    const qualityButtons = document.querySelectorAll('.quality-btn');

    let size = '';
    let style = '';
    let quality = '';

    // Determine selected size
    sizeButtons.forEach(button => {
      if (button.classList.contains('active')) {
        size = button.dataset.value;
      }
    });

    // Determine selected style
    styleButtons.forEach(button => {
      if (button.classList.contains('active')) {
        style = button.dataset.value;
      }
    });

    // Determine selected quality
    qualityButtons.forEach(button => {
      if (button.classList.contains('active')) {
        quality = button.dataset.value;
      }
    });

    // Validate prompt input
    if (!prompt) {
      alert('Please enter a description or keyword.');
      return;
    }

    // Show loading indicator
    loadingIndicator.classList.remove('hidden');

    try {
      // Make POST request to /generate endpoint
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, style, quality })
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();

      // Display generated images
      if (data.imageUrls && data.imageUrls.length > 0) {
        data.imageUrls.forEach(url => {
          if (size === '1600x900' || size === '1080x1920' || size === '1920x1080') {
            const [width, height] = size.split('x').map(Number);
            resizeImage(url, width, height).then(resizedUrl => {
              const imageWrapper = createImageWrapper(resizedUrl, width, height);
              swiper.prependSlide(imageWrapper); // Prepend slide to Swiper
              swiper.slideTo(0); // Slide to the newly added image
            });
          } else {
            const imageWrapper = createImageWrapper(url);
            swiper.prependSlide(imageWrapper); // Prepend slide to Swiper
            swiper.slideTo(0); // Slide to the newly added image
          }
        });
      } else {
        throw new Error('No images returned');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images.');
    } finally {
      // Hide loading indicator
      loadingIndicator.classList.add('hidden');
    }
  }

  // Function to regenerate images based on user inputs
  async function regenerateImage() {
    // Clear existing slides
    swiper.removeAllSlides();

    // Regenerate images with the same inputs
    await generateImage();
  }

  // Function to resize image using canvas
  function resizeImage(url, width, height) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match desired dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image onto canvas at desired dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 representation of resized image without compression
        canvas.toBlob(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Function to create image wrapper with buttons
  function createImageWrapper(url, width, height) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'swiper-slide relative bg-white dark:bg-gray-700 p-2 rounded-lg shadow-lg';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Generated Image';
    img.className = 'w-full h-auto rounded-lg';

    const buttonRow = document.createElement('div');
    buttonRow.className = 'button-row absolute bottom-2 right-2 flex space-x-2';

    const downloadButton = createIconButton('fas fa-download', function () {
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated_image.png`; // Set the download attribute
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    const trashButton = createIconButton('fas fa-trash', function () {
      swiper.removeSlide(swiper.realIndex);
    });

    buttonRow.appendChild(downloadButton);
    buttonRow.appendChild(trashButton);

    imageWrapper.appendChild(img);
    imageWrapper.appendChild(buttonRow);

    return imageWrapper;
  }

  // Function to create icon button
  function createIconButton(iconClass, onClick) {
    const button = document.createElement('button');
    button.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded';
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.addEventListener('click', onClick);
    return button;
  }

  // Event listeners for size, style, and quality buttons
  document.querySelectorAll('.size-btn').forEach(button => {
    button.addEventListener('click', function () {
      toggleButton(button);
    });
  });

  document.querySelectorAll('.style-btn').forEach(button => {
    button.addEventListener('click', function () {
      toggleButton(button);
    });
  });

  document.querySelectorAll('.quality-btn').forEach(button => {
    button.addEventListener('click', function () {
      toggleButton(button);
    });
  });

  // Function to toggle button active state
  function toggleButton(button) {
    const siblings = button.parentElement.querySelectorAll('.button-style');
    siblings.forEach(sibling => sibling.classList.remove('active'));
    button.classList.add('active');
  }
});
