let hoverTimeout;

document.querySelectorAll('.container-card').forEach(card => {
    let img = card.querySelector('.image');
    img.style.cursor = "pointer";

    img.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            const index = parseInt(card.dataset.index);
            openModal(filteredCharacters[index]);
        }, 300); // Se abre después de 300ms
    });

    img.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout); // Cancela la apertura si el usuario se mueve rápido
    });
});
