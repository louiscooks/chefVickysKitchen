const btn = document.querySelectorAll(".remove");

btn.forEach((btnRemove) => {
	btnRemove.addEventListener("click", (e) => {
		e.preventDefault();
		const card = btnRemove.parentNode.parentNode.parentElement.parentElement;
		card.remove();
	});
});
