<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// /products は / (ホームページ)にリダイレクト
		goto('/');
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="text-center">
		<div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
		<p class="text-sm text-gray-500">商品ページへ移動中...</p>
	</div>
</div>
