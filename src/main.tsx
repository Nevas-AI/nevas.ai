import "../assets/index-BLfrN5cK.css";
import "../assets/index-DupR9Cbc.js";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "";

const targetMap: Record<string, string> = {
	home: "root",
	"about us": "about-us",
	services: "services",
	faq: "faq",
	"contact us": "contact",
};

const normalizeLabel = (label: string | null | undefined) =>
	label?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";

const scrollToSection = (id: string) => {
	const target = document.getElementById(id);
	if (!target) {
		window.scrollTo({ top: 0, behavior: "smooth" });
		return;
	}

	const offset = 90;
	const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
	window.scrollTo({ top, behavior: "smooth" });

	requestAnimationFrame(() => {
		const finalTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
		if (Math.abs(finalTop - window.scrollY) > 8) {
			window.scrollTo({ top: finalTop, behavior: "auto" });
		}
	});
};

const connectLink = (link: HTMLAnchorElement, targetId: string) => {
	const id = targetId.replace(/^#/, "");
	link.href = `#${id}`;
	link.onclick = (event) => {
		event.preventDefault();
		scrollToSection(id);
		history.replaceState(null, "", `#${id}`);
	};
};

const connectContactButtons = () => {
	const contactButtonLabels = [
		"schedule a meeting",
		"talk to our ai fashion experts",
		"get started",
	];

	for (const button of Array.from(document.querySelectorAll<HTMLButtonElement>("button"))) {
		if (button.form || button.dataset.contactPatched === "true") continue;

		const label = normalizeLabel(button.textContent);
		if (!contactButtonLabels.some((buttonLabel) => label.includes(buttonLabel))) continue;

		button.dataset.contactPatched = "true";
		button.addEventListener("click", (event) => {
			event.preventDefault();
			scrollToSection("contact");
			history.replaceState(null, "", "#contact");
		});
	}
};

const reorderDesktopNav = () => {
	const uls = Array.from(document.querySelectorAll("ul"));
	const desired = ["services", "about us", "contact us"];

	for (const ul of uls) {
		const items = Array.from(ul.children).filter(
			(c): c is HTMLLIElement => c.tagName === "LI",
		);
		if (items.length !== 3) continue;

		const labels = items.map((li) => normalizeLabel(li.textContent));
		if (!desired.every((label) => labels.includes(label))) continue;

		if (
			labels[0] === "services" &&
			labels[1] === "about us" &&
			labels[2] === "contact us"
		) {
			return;
		}

		const byLabel = new Map<string, HTMLLIElement>();
		items.forEach((li, index) => byLabel.set(labels[index], li));
		desired.forEach((label) => {
			const li = byLabel.get(label);
			if (li) ul.appendChild(li);
		});
		return;
	}
};

const removeExpertAutomationSection = () => {
	const heading = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).find((element) =>
		normalizeLabel(element.textContent).includes("our expert ai automation services"),
	);

	heading?.closest("section")?.remove();
};

const wireNavigation = () => {
	removeExpertAutomationSection();
	connectContactButtons();
	const servicesSection = document.getElementById("solutions");
	if (servicesSection) servicesSection.id = "services";
	const aboutSection = document.getElementById("digital-agencies");
	if (aboutSection) aboutSection.id = "about-us";
	reorderDesktopNav();

	const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
	for (const link of links) {
		const label = normalizeLabel(link.textContent);
		const targetId = targetMap[label];
		if (!targetId) continue;
		connectLink(link, targetId);
	}

	const aboutHeading = Array.from(document.querySelectorAll("h2")).find((heading) =>
		heading.textContent?.toLowerCase().includes("there are so many digital"),
	);
	if (aboutHeading) {
		const existingAbout = document.getElementById("about-us");
		if (existingAbout && existingAbout !== aboutHeading) existingAbout.removeAttribute("id");
		aboutHeading.id = "about-us";
	}

	const faqHeading = Array.from(document.querySelectorAll("h2")).find((heading) =>
		normalizeLabel(heading.textContent) === "frequently asked questions",
	);
	if (faqHeading) {
		const faqSection = faqHeading.parentElement?.parentElement;
		if (faqSection && !faqSection.id) faqSection.id = "faq";
	}

	const fallbackAbout = document.getElementById("about-us") ?? document.getElementById("digital-agencies");
	if (fallbackAbout && !fallbackAbout.id) {
		fallbackAbout.id = "about-us";
	}
};

const interceptContactForm = () => {
	const form = Array.from(document.querySelectorAll("form")).find(
		(f) => f.querySelector('textarea[name="message"]') && f.querySelector('input[name="email"]'),
	) as HTMLFormElement | null;

	if (!form || form.dataset.patched === "true") return;
	form.dataset.patched = "true";

	form.addEventListener(
		"submit",
		async (event) => {
			event.preventDefault();
			event.stopImmediatePropagation();

			const submitBtn = form.querySelector("button") as HTMLButtonElement | null;
			const originalText = submitBtn?.textContent ?? "Send Message";
			const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
			const emailParams = {
				from_name: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
				from_email: payload.email ?? "",
				phone: payload.phone ?? "",
				message: payload.message ?? "",
			};

			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = "Sending...";
			}

			try {
				if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
					throw new Error("EmailJS configuration is missing.");
				}

				await emailjs.send(
					EMAILJS_SERVICE_ID,
					EMAILJS_TEMPLATE_ID,
					emailParams,
					{ publicKey: EMAILJS_PUBLIC_KEY },
				);

				if (submitBtn) submitBtn.textContent = "Message Sent";
			} catch (error) {
				console.error("Contact form submission failed:", error);
				if (submitBtn) submitBtn.textContent = "Try Again";
			}
			finally {
				if (submitBtn) {
					window.setTimeout(() => {
						submitBtn.disabled = false;
						submitBtn.textContent = originalText;
					}, 2500);
				}
			}
		},
		true,
	);
};

const init = () => {
	wireNavigation();
	interceptContactForm();

	const root = document.getElementById("root");
	if (!root) return;

	const observer = new MutationObserver(() => {
		removeExpertAutomationSection();
		connectContactButtons();
		wireNavigation();
		interceptContactForm();
	});
	observer.observe(root, { childList: true, subtree: true });
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
	init();
}