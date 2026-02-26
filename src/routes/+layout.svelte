<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<Header />
	<main>{@render children()}</main>
	<Footer />
</div>

<!-- Global Toast Notification System -->
<Toast />

<style>
	.app {
		display: flex;
		flex-direction:column;
		min-height: 100vh;
	}
	main {
		flex: 1;
		display: flex;
		flex-direction:column;
		padding: 1rem;
		width: 100%;
		max-width: 82rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
