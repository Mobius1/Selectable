const selectable = new Selectable({
	lassoSelect: "sequential",
	appendTo: "#calendar",
	filter: ".day",
	lasso: {
		border: "2px dashed rgba(255, 255, 255, 0)",
		backgroundColor: "rgba(255, 255, 255, 0)"
	},
});