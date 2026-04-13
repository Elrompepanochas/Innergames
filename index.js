 
 const track = document.getElementById('track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsDiv = document.getElementById('dots');
 
const cards = track.querySelectorAll('.game-card');
const totalCards = cards.length;
const visibles = 4;
const totalPaginas = Math.ceil(totalCards / visibles);
let paginaActual = 0;
let temporizador;
 
// ----- Crear los puntos (Dots) -----
function generarDots() {
    dotsDiv.innerHTML = ''; // Limpiar por seguridad
    for (let i = 0; i < totalPaginas; i++) {
        const punto = document.createElement('button');
        punto.className = 'dot' + (i === 0 ? ' active' : '');
        punto.addEventListener('click', () => irA(i));
        dotsDiv.appendChild(punto);
    }
}
 
// ----- Calcular ancho real (incluyendo el gap) -----
function obtenerAnchoDesplazamiento() {
    if (cards.length === 0) return 0;
   
    // Obtenemos el ancho de una tarjeta
    const anchoCard = cards[0].offsetWidth;
   
    // Intentamos obtener el gap real del CSS, si no, usamos 20 por defecto
    const estiloTrack = window.getComputedStyle(track);
    const gap = parseInt(estiloTrack.columnGap) || 20;
   
    return (anchoCard + gap) * visibles;
}
 
// ----- Función para ir a una página -----
function irA(pagina) {
    // Lógica circular (dar la vuelta)
    if (pagina < 0) {
        pagina = totalPaginas - 1;
    } else if (pagina >= totalPaginas) {
        pagina = 0;
    }
 
    paginaActual = pagina;
 
    // Mover el track
    const desplazamiento = paginaActual * obtenerAnchoDesplazamiento();
    track.style.transform = `translateX(-${desplazamiento}px)`;
 
    // Actualizar estado de los puntos
    const todosLosDots = dotsDiv.querySelectorAll('.dot');
    todosLosDots.forEach((punto, indice) => {
        punto.classList.toggle('active', indice === paginaActual);
    });
 
    // En modo circular, mantenemos la opacidad normal
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
}
 
// ----- Gestión del Tiempo -----
function iniciarAutoScroll() {
    temporizador = setInterval(() => {
        irA(paginaActual + 1);
    }, 4500);
}
 
function reiniciarTemporizador() {
    clearInterval(temporizador);
    iniciarAutoScroll();
}
 
// ----- Eventos de Botones -----
prevBtn.addEventListener('click', () => {
    irA(paginaActual - 1);
    reiniciarTemporizador();
});
 
nextBtn.addEventListener('click', () => {
    irA(paginaActual + 1);
    reiniciarTemporizador();
});
 
// Re-ajustar posición si cambias el tamaño de la ventana (Responsive)
window.addEventListener('resize', () => {
    irA(paginaActual);
});
 
// ----- Inicialización -----
document.addEventListener('DOMContentLoaded', () => {
    generarDots();
    irA(0);
    iniciarAutoScroll();
});
 
 
// ----- Inicio -----
irA(0);
 
function irAPagina(url) {
    if (url) {
        window.location.href = url;
    }
}