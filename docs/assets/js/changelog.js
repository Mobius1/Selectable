
fetch("https://api.github.com/repos/Mobius1/Selectable/releases").then(resp => resp.json()).then(render);

function render(json) {
	console.log(json[0])

	const frag = document.createDocumentFragment();
	json.forEach(item => {

		const entry = document.createElement("div");
		entry.className = "entry";

		const converter = new showdown.Converter();
		const text      = item.body.replace(/\#\#/g, "#####");
		const html      = converter.makeHtml(text);

		const template = `<div class="title">
			                    <h3>${moment(item.published_at).format("MMM DD, YYYY")}</h3>
			                    <p>${item.name}</p>
			                </div>
			                <div class="timeline-body">
			                	<h2>${item.name}</h2>
								<div class="info">${html}</div>
			                    <ul class="tag-references">
			                        <li class="commit">
			                            <a href="${item.html_url}">
			                                <svg class="octicon octicon-git-commit" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M10.86 7c-.45-1.72-2-3-3.86-3-1.86 0-3.41 1.28-3.86 3H0v2h3.14c.45 1.72 2 3 3.86 3 1.86 0 3.41-1.28 3.86-3H14V7h-3.14zM7 10.2c-1.22 0-2.2-.98-2.2-2.2 0-1.22.98-2.2 2.2-2.2 1.22 0 2.2.98 2.2 2.2 0 1.22-.98 2.2-2.2 2.2z"></path></svg>
			                                ${item.id}
			                            </a>
			                        </li>
			                        <li>
			                            <a href="https://github.com/Mobius1/Selectable/archive/${item.tag_name}.zip" rel="nofollow">
			                                <svg class="octicon octicon-file-zip" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.5L8.5 1zM11 14H1V2h3v1h1V2h3l3 3v9zM5 4V3h1v1H5zM4 4h1v1H4V4zm1 2V5h1v1H5zM4 6h1v1H4V6zm1 2V7h1v1H5zM4 9.28A2 2 0 0 0 3 11v1h4v-1a2 2 0 0 0-2-2V8H4v1.28zM6 10v1H4v-1h2z"></path></svg>
			                                zip
			                            </a>
			                        </li>
			                        <li>
			                            <a href="https://github.com/Mobius1/Selectable/archive/${item.tag_name}.tar.gz" rel="nofollow">
			                                <svg class="octicon octicon-file-zip" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.5L8.5 1zM11 14H1V2h3v1h1V2h3l3 3v9zM5 4V3h1v1H5zM4 4h1v1H4V4zm1 2V5h1v1H5zM4 6h1v1H4V6zm1 2V7h1v1H5zM4 9.28A2 2 0 0 0 3 11v1h4v-1a2 2 0 0 0-2-2V8H4v1.28zM6 10v1H4v-1h2z"></path></svg>
			                                tar.gz
			                            </a>
			                        </li>
			                    </ul>
			                </div>`;

		entry.innerHTML = template;

		frag.appendChild(entry);
	});

	document.getElementById("timeline").appendChild(frag);
}