const div = document.getElementById("results");
const params = window.location.search.substring(1).split("&");
const obj = {};

const list = [
	"events.html",
	"index.html",
	"api/options/throttle.html",
	"api/options/appendTo.html",
	"api/options/ignore.html",
	"api/options/classes.html",
	"api/options/filter.html",
	"api/options/autoScroll.html",
	"api/options/autoRefresh.html",
	"api/options/toggle.html",
	"api/options/tolerance.html",
	"api/options/lasso.html",
	"api/methods/unselect.html",
	"api/methods/select.html",
	"api/methods/selectAll.html",
	"api/methods/disable.html",
	"api/methods/update.html",
	"api/methods/enable.html",
	"api/methods/add.html",
	"api/methods/get.html",
	"api/methods/clear.html",
	"api/methods/on.html",
	"api/methods/invert.html",
	"api/methods/remove.html",
	"api/methods/init.html",
	"api/methods/recalculate.html",
	"api/methods/destroy.html",
	"api/methods/off.html",
	"getting-started.html",
	"public-methods.html",
	"options.html"
];

params.forEach(str => {
	const items = str.split("=");
	obj[items[0]] = items[1];
});

const results = [];

list.forEach(item => {
	if ( item.includes(obj["q"]) ) {
		results.push(item);
	}
});

if ( results.length ) {
	const frag = document.createDocumentFragment();

	results.forEach(item => {
		const li = document.createElement("li");
		const link = document.createElement("a");
		link.href = `https://mobius1.github.io/Selectable/${item}`;
		link.textContent = item.replace(/api\/([\w]+)\//g, "").replace(/\.html/g, "");

		li.appendChild(link);

		frag.appendChild(li);
	})

	div.innerHTML = "";
	div.appendChild(frag);

} else {
	div.innerHTML = "No results";
}