/* --------- DROPZONE INSTANCE --------- */
const DROPZONE = new Dropzone("#dropzone", {
	autoProcessQueue: false,
	clickable: '#addFiles',
	parallelUploads: 5,
	previewTemplate: document.getElementById("template").innerHTML
});

/* --------- SELECTABLE INSTANCE --------- */
const SELECTABLE = new Selectable({
	appendTo: "#dropzone",
	ignore: "[data-dz-remove]", // stop remove button triggering selection
	lasso: {
		border: "1px solid rgba(155, 155, 155,1.0)",
		backgroundColor: "rgba(255, 255, 255,0.4)"
	}
});

/* --------- BUTTONS --------- */
const removeFiles = document.getElementById("removeFiles");

removeFiles.addEventListener("click", e => {
	// get files
	const files = DROPZONE.files;
	
	if ( files.length ) {
		for ( const file of files ) {
			// get the item instance from Selectable
			const el = SELECTABLE.get(file.previewElement);
			
			// if it's selected, then remove it.
			// Dropzone is set to listen to "removedfile" and 
			// will remove it from the Selectable instance
			if ( el.selected ) {
				DROPZONE.removeFile(file);
				
				// hide the button
				removeFiles.classList.remove("active");
			}
		}
	}
});

/* --------- SELECTABLE EVENTS --------- */
SELECTABLE.on("selectable.end", (e, selected) => {
	// show the "removeFiles" button if we have selected files
	removeFiles.classList.toggle("active", selected.length);
});

/* --------- DROPZONE EVENTS --------- */
DROPZONE.on("addedfile", function(file) {
	const el = file.previewElement;
	
	// add element to Selectable instance when added by Dropzone
	SELECTABLE.add(el);
	
	file.previewElement.querySelector(".file-progress-text").textContent = "Ready";
	file.previewElement.querySelector(".file-text").textContent = "Waiting";
	
	// bounce animation
	el.classList.add("animated", "bounceIn");
	setTimeout(() => {
		el.classList.remove("animated", "bounceIn");
	}, 550);	
});

DROPZONE.on("removedfile", function(file) {
	const el = file.previewElement;
	
	// remove element from Selectable instance when removed by Dropzone
	SELECTABLE.remove(el);
});

// this is just for the upload progress indicator
DROPZONE.on("uploadprogress", (file, progress) => {
		const el = file.previewElement;
		const circle = el.querySelector("circle");
		const r = circle.getAttribute("r");
		const circ = 2 * Math.PI * r;	
		const p = Math.round(progress);
		
		circle.style.strokeDashoffset = circ - (circ * (progress / 100));
		
		el.classList.remove("loading");
		el.querySelector(".mdi").classList.add("mdi-upload");
		el.querySelector(".file-progress-text").textContent = `Processing`;	
		el.querySelector(".file-text").textContent = p === 100 ? `Uploaded` : `Uploading ${p}%`;	
});

DROPZONE.on("complete", function(file) {
	const el = file.previewElement;
	const mdi = el.querySelector(".mdi");
	
	mdi.classList.remove("mdi-upload");
	mdi.classList.add("mdi-check");
	el.querySelector(".file-progress-text").textContent = `Upload complete`;
});