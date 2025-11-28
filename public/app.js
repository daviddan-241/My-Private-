const form = document.getElementById('uploadForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // redirect to Stripe Checkout
  } else {
    alert('Payment session failed');
  }
});