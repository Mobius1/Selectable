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
		el.querySelector(".file-progress-text").textContent = file.mock ? `Done` : `Processing`;	
		el.querySelector(".file-text").textContent = p === 100 ? `Uploaded` : `Uploading ${p}%`;	
});

DROPZONE.on("success", function(file) {
	const el = file.previewElement;
	const mdi = el.querySelector(".mdi");
	
	mdi.classList.remove("mdi-upload");
	mdi.classList.add("mdi-check");
	el.querySelector(".file-progress-text").textContent = `Upload complete`;
});

DROPZONE.on("error", function(file, message, xhr) {
	const el = file.previewElement;
	const mdi = el.querySelector(".mdi");
	
	console.log(arguments)
	
	mdi.classList.remove("mdi-upload");
	mdi.classList.add("mdi-close");
	el.querySelector(".file-progress-text").textContent = `ERROR`;
	el.querySelector(".file-text").textContent = xhr.statusText;
});


/* ---------- MOCK FILES ---------- */
for ( let i = 0; i < 3; i++ ) {
	// Create the mock file:
	var mockFile = { name: makeid(8), size: randSize(100, 10000000), mock: true };

	// Call the default addedfile event handler
	DROPZONE.emit("addedfile", mockFile);

	// And optionally show the thumbnail of the file:
	DROPZONE.emit("thumbnail", mockFile, "/image/url");

	// Make sure that there is no progress bar, etc...
	DROPZONE.emit("uploadprogress", mockFile, 100);
	DROPZONE.emit("complete", mockFile);
	
	DROPZONE.files.push(mockFile);
	
	SELECTABLE.add(mockFile.previewElement);
}

/* ---------- HELPER FUNCTIONS ---------- */

function randSize(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeid(n) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	const extensions = [".jpg", ".png", ".mp3", ".zip"];
	const ext = extensions[Math.floor(Math.random()*extensions.length)];

  for (var i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

  return `${text}${ext}`;
}