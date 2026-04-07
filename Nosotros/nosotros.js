function abrirModal() {
    document.getElementById("miModal").classList.add("activo");
}

function cerrarModal() {
    document.getElementById("miModal").classList.remove("activo");
}

// Cerrar si el usuario hace click fuera del modal
window.onclick = function(e) {
    const modal = document.getElementById("miModal");
    if (e.target === modal) {
        cerrarModal();
    }
}