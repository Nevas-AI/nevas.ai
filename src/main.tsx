import "../assets/index-BLfrN5cK.css";
import "../assets/index-DupR9Cbc.js";

const wireNavigation = () => {
	const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
	const connect = (link: HTMLAnchorElement, targetId: string) => {
		link.href = `#${targetId}`;
		link.onclick = (event) => {
			event.preventDefault();
			document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
			window.history.replaceState(null, "", `#${targetId}`);
		};
	};

	links.filter((link) => link.textContent?.trim().toLowerCase() === "about us").forEach((link) => {
		connect(link, "digital-agencies");
	});

	links.filter((link) => link.textContent?.trim().toLowerCase() === "services").forEach((link) => {
		connect(link, "solutions");
	});

	links.filter((link) => link.textContent?.trim().toLowerCase() === "contact us").forEach((link) => {
		connect(link, "contact");
	});

	const aboutHeading = Array.from(document.querySelectorAll("h2")).find((heading) =>
		heading.textContent?.toLowerCase().includes("there are so many digital"),
	);

		aboutHeading?.setAttribute("id", "digital-agencies");
};

	const root = document.getElementById("root");
	const observer = new MutationObserver(() => {
		if (document.querySelector("#contact") && Array.from(document.querySelectorAll("h2")).some((heading) => heading.textContent?.toLowerCase().includes("there are so many digital"))) {
			wireNavigation();
			observer.disconnect();
		}
	});

	if (root) {
		observer.observe(root, { childList: true, subtree: true });
	}