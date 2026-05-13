(function () {
	function sanitizeFileName(name) {
		return name.replace(/[\\/:*?"<>|]/g, "-").trim();
	}

	function waitForImageLoaded(imageElement) {
		return new Promise((resolve) => {
			if (imageElement.complete && imageElement.naturalWidth > 0) {
				resolve();
				return;
			}

			const done = () => {
				imageElement.removeEventListener("load", done);
				imageElement.removeEventListener("error", done);
				resolve();
			};

			imageElement.addEventListener("load", done, { once: true });
			imageElement.addEventListener("error", done, { once: true });
		});
	}

	function nextFrame() {
		return new Promise((resolve) => requestAnimationFrame(resolve));
	}

	async function exportCurrentPoster(poster, fileName) {
		const canvas = await html2canvas(poster, {
			backgroundColor: null,
			scale: 2,
			useCORS: true,
		});

		const link = document.createElement("a");
		link.href = canvas.toDataURL("image/png");
		link.download = fileName;
		link.click();
	}

	function createPosterBatchExporter(options) {
		const {
			members,
			memberSelect,
			memberPhoto,
			poster,
			batchExportBtn,
			renderMember,
		} = options;

		return async function batchExportPosters() {
			if (typeof html2canvas !== "function") {
				alert("html2canvas 未加载，无法导出。");
				return;
			}

			batchExportBtn.disabled = true;
			const originalText = batchExportBtn.textContent;
			const originalIndex = Number(memberSelect.value);

			try {
				for (let i = 0; i < members.length; i += 1) {
					const member = members[i];
					memberSelect.value = String(i);
					renderMember(member);

					batchExportBtn.textContent = `导出中 ${i + 1}/${members.length}`;

					await waitForImageLoaded(memberPhoto);
					await nextFrame();
					await nextFrame();

					const fileName = `${String(i + 1).padStart(2, "0")}-${sanitizeFileName(member.name)}.png`;
					await exportCurrentPoster(poster, fileName);
				}
			} finally {
				memberSelect.value = String(originalIndex);
				renderMember(members[originalIndex]);
				batchExportBtn.textContent = originalText;
				batchExportBtn.disabled = false;
			}
		};
	}

	window.createPosterBatchExporter = createPosterBatchExporter;
	window.exportCurrentPoster = exportCurrentPoster;
	window.sanitizeFileName = sanitizeFileName;
})();
