<script lang="ts">
	import { page } from '$app/state';
	$: productId = Number(page.params.id);
</script>

<h1>product {productId}</h1>
