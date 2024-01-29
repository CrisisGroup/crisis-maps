function toggleImages() {
    document.getElementById('image1').classList.toggle('show');
    document.getElementById('image2').classList.toggle('show');
}

document.getElementById('toggleButton').addEventListener('click', toggleImages);
document.getElementById('image1').addEventListener('click', toggleImages);
document.getElementById('image2').addEventListener('click', toggleImages);
