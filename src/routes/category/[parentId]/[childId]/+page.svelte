<script lang="ts">
	import { page } from '$app/state';
	import { quickCategories } from '$lib/mockdata/Category.js';
	$: mainId = Number(page.params.parentId);
	$: subId = Number(page.params.childId);
</script>

<h1>分类 {mainId}</h1>
{#each quickCategories.filter((item) => item.id === mainId) as category}
	{#each category.children as subCategory}
		{#if subCategory.id === subId}
			<p>{subCategory.name}</p>
		{/if}
	{/each}
{/each}
