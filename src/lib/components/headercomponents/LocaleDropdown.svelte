<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let locales = [
		{
			code: 'ja-JP',
			name: '日本',
			language: 'JA',
			currency: 'JPY',
			flag: '🇯🇵'
		},
		{
			code: 'en-US',
			name: 'United States',
			language: 'EN',
			currency: 'USD',
			flag: '🇺🇸'
		},
		{
			code: 'zh-CN',
			name: '中国',
			language: 'CN',
			currency: 'CNY',
			flag: '🇨🇳'
		},
		{
			code: 'ko-KR',
			name: '한국',
			language: 'KO',
			currency: 'KRW',
			flag: '🇰🇷'
		}
	];

	export let currentLocale = locales[0];

	// Events
	const dispatch = createEventDispatcher();

	// State
	let showDropdown = false;
	let dropdownTimeout: number;

	function openDropdown() {
		clearTimeout(dropdownTimeout);
		showDropdown = true;
	}

	function closeDropdown() {
		dropdownTimeout = window.setTimeout(() => {
			showDropdown = false;
		}, 150);
	}

	function selectLocale(locale: (typeof locales)[0]) {
		currentLocale = locale;
		dispatch('change', locale);
		showDropdown = false;
	}
</script>

<div
	class="locale-dropdown-container relative"
	on:mouseenter={openDropdown}
	on:mouseleave={closeDropdown}
>
	<button
		class="locale-button hidden min-w-[110px] items-center gap-2 rounded-lg bg-white px-3 py-2 font-mono text-xs text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 lg:flex"
		aria-haspopup="true"
		aria-expanded={showDropdown}
	>
		<span class="text-2xl">{currentLocale.flag}</span>
		<div class="flex flex-col overflow-hidden text-left leading-tight">
			<span class="truncate text-xs text-gray-500"
				>{currentLocale.name} / {currentLocale.language}</span
			>
			<span class="truncate text-xs font-medium">{currentLocale.currency}</span>
		</div>
	</button>

	<!-- Locale Dropdown -->
	{#if showDropdown}
		<div
			class="locale-dropdown absolute top-full right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
			on:mouseenter={openDropdown}
			on:mouseleave={closeDropdown}
			role="menu"
		>
			<div class="px-3 py-2">
				<p class="text-xs font-medium text-gray-500">言語と地域を選択</p>
			</div>
			<div class="my-1 border-t border-gray-100"></div>
			{#each locales as locale}
				<button
					on:click={() => selectLocale(locale)}
					class="locale-option flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 {currentLocale.code ===
					locale.code
						? 'bg-gray-50 text-gray-900'
						: 'text-gray-700'}"
					role="menuitem"
				>
					<span class="text-2xl">{locale.flag}</span>
					<div class="flex flex-1 flex-col text-left">
						<span class="font-medium">{locale.name}</span>
						<span class="text-xs text-gray-500">{locale.language} • {locale.currency}</span>
					</div>
					{#if currentLocale.code === locale.code}
						<svg
							class="h-4 w-4 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.locale-dropdown {
		animation: fadeIn 0.2s ease-out;
		z-index: 50;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.locale-option {
		position: relative;
	}

	@media (max-width: 1280px) {
		.locale-button {
			min-width: 100px;
		}
	}
</style>
