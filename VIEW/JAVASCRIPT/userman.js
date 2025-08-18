// User Management Logic
(function () {
	const rows = document.getElementById("user-rows");
	const filter = document.getElementById("filter");
	const empty = document.getElementById("empty");
	const count = document.getElementById("count");

	function read() {
		try {
			return JSON.parse(localStorage.getItem("gg_users") || "[]");
		} catch {
			return [];
		}
	}
	function write(list) {
		localStorage.setItem("gg_users", JSON.stringify(list));
	}
			function seedIfNeeded() {
				const current = read();
				if (current.length === 10) return; // already correct size
				// Provide 10 sample users with realistic variation
				const samples = [
					{ name: "Alex Cruz", subscription: "member" },
					{ name: "Brielle Santos", subscription: "monthly" },
					{ name: "Carlos Mendoza", subscription: "walk-in" },
					{ name: "Dana Lee", subscription: "member" },
					{ name: "Evan Brooks", subscription: "monthly" },
					{ name: "Faith Navarro", subscription: "walk-in" },
					{ name: "Gio Ramirez", subscription: "member" },
					{ name: "Harper Wang", subscription: "monthly" },
					{ name: "Ivan Petrov", subscription: "walk-in" },
					{ name: "Jade Kim", subscription: "member" },
				];
				const now = new Date();
				const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
				const data = samples.map((s, i) => {
					const start = new Date(now);
					// distribute starts over past 45 days
					start.setDate(now.getDate() - (i * 4 + rng(0, 3)));
					const due = new Date(start);
					if (s.subscription === "walk-in") {
						// walk-in due same day/next day
						due.setDate(start.getDate() + rng(0, 1));
					} else {
						// monthly/member ~30 days +/- up to 5 days
						due.setDate(start.getDate() + 30 + rng(-5, 5));
					}
					return {
						id: `${Date.now()}:${i}:${Math.random().toString(16).slice(2, 6)}`,
						name: s.name,
						subscription: s.subscription,
						start: start.toISOString().slice(0, 10),
						due: due.toISOString().slice(0, 10),
					};
				});
				write(data);
			}
	function statusFor(dueStr) {
		const now = new Date();
		const d = new Date(dueStr);
		const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
		if (diffDays < 0) return { label: "Expired", cls: "expired" };
		if (diffDays <= 5) return { label: `Due in ${diffDays}d`, cls: "due-soon" };
		return { label: "Active", cls: "active" };
	}
	function subBadge(sub) {
		const map = { "walk-in": "Walk-in", monthly: "Monthly", member: "Member" };
		return `<span class="badge ${sub}">${map[sub] || sub}</span>`;
	}
	function fmt(dateStr) {
		try {
			const d = new Date(dateStr + "T00:00:00");
			return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
		} catch {
			return dateStr;
		}
	}
	function render() {
		const list = read();
		const q = (filter && filter.value) || "all";
		const filtered = list.filter((u) => (q === "all" ? true : u.subscription === q));
		rows.innerHTML = filtered
			.map((u) => {
				const st = statusFor(u.due);
				return `
					<tr data-id="${u.id}">
						<td>${u.name}</td>
						<td>${subBadge(u.subscription)}</td>
						<td>${fmt(u.start)}</td>
						<td>${fmt(u.due)}</td>
						<td><span class="status ${st.cls}">${st.label}</span></td>
						<td class="col-actions">
							<button class="btn btn--ghost btn--sm js-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
							<button class="btn btn--ghost btn--sm js-del" title="Delete"><i class="fa-solid fa-trash"></i></button>
						</td>
					</tr>`;
			})
			.join("");
		const total = list.length;
		const shown = filtered.length;
		if (count) count.textContent = total ? `(${shown}/${total})` : "";
		empty.style.display = shown ? "none" : "block";
	}

	function addUser(u) {
		const list = read();
		list.push({ ...u, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) });
		write(list);
		render();
	}
	function updateUser(id, partial) {
		const list = read();
		const i = list.findIndex((x) => x.id === id);
		if (i >= 0) {
			list[i] = { ...list[i], ...partial };
			write(list);
			render();
		}
	}
	function deleteUser(id) {
		const list = read().filter((x) => x.id !== id);
		write(list);
		render();
	}

		// Events
	if (filter) {
		filter.addEventListener("change", render);
	}
	if (rows) {
		rows.addEventListener("click", (e) => {
			const btn = e.target.closest("button");
			if (!btn) return;
			const tr = btn.closest("tr");
			if (!tr) return;
			const id = tr.getAttribute("data-id");
			if (!id) return;
			if (btn.classList.contains("js-del")) {
				if (confirm("Delete this user?")) deleteUser(id);
			} else if (btn.classList.contains("js-edit")) {
				// simple inline edit prompt flow
				const list = read();
				const user = list.find((x) => x.id === id);
				if (!user) return;
				const name = prompt("Name", user.name);
				if (!name) return;
				const subscription = prompt("Subscription (walk-in|monthly|member)", user.subscription) || user.subscription;
				const start = prompt("Start (YYYY-MM-DD)", user.start) || user.start;
				const due = prompt("Due (YYYY-MM-DD)", user.due) || user.due;
				updateUser(id, { name: name.trim(), subscription: subscription.trim(), start, due });
			}
		});
	}

			// Initial render
			seedIfNeeded();
	render();
})();

