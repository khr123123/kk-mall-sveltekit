<!-- routes/checkout/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// SVG 图标
	const icons = {
		home: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
		building: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
		check: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
		edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
		add: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
		creditCard: `<svg t="1766390698117" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12193" width="300" height="300"><path d="M917.376 896 106.624 896C47.744 896 0 845.44 0 782.976L0 240.96C0 178.56 47.744 128 106.624 128l810.752 0C976.256 128 1024 178.56 1024 240.96l0 67.712L1024 444.16l0 338.816C1024 845.44 976.256 896 917.376 896L917.376 896zM981.376 272.896c0-55.104-42.112-99.712-93.952-99.712L136.576 173.184c-51.84 0-93.888 44.608-93.888 99.712l0 35.84 938.688 0L981.376 272.896 981.376 272.896zM42.688 444.16l0 306.944c0 55.04 42.048 99.712 93.888 99.712l750.848 0c51.84 0 93.952-44.608 93.952-99.712L981.376 444.16 42.688 444.16 42.688 444.16zM661.312 782.976l64-135.488 213.376 0-64 135.488L661.312 782.976 661.312 782.976z" fill="#272636" p-id="12194"></path></svg>`,
		paypay: `<svg t="1766390541440" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2234" width="300" height="300"><path d="M6.4 145.6c4.8-48 27.2-86.4 67.2-113.6C97.6 16 124.8 8 155.2 8h713.6c81.6 0 147.2 65.6 147.2 147.2v713.6c0 81.6-65.6 147.2-147.2 147.2H264c4.8-19.2 9.6-38.4 12.8-56 9.6-40 19.2-81.6 28.8-121.6 1.6-9.6 6.4-12.8 16-12.8 65.6-8 129.6-14.4 193.6-25.6 68.8-12.8 136-33.6 195.2-70.4 75.2-44.8 123.2-108.8 137.6-195.2 9.6-54.4-4.8-104-36.8-148.8-35.2-51.2-84.8-88-139.2-118.4-81.6-44.8-168-70.4-259.2-89.6C286.4 152 153.6 144 20.8 147.2H9.6s-1.6 0-3.2-1.6z" fill="#E50012" p-id="2235"></path><path d="M6.4 323.2c123.2-12.8 244.8-14.4 368-3.2-4.8 22.4-9.6 41.6-16 62.4-51.2 208-102.4 414.4-153.6 622.4-1.6 8-4.8 11.2-12.8 11.2-30.4 0-59.2 1.6-89.6-9.6-57.6-22.4-96-76.8-96-139.2V337.6v-14.4zM340.8 702.4c6.4-27.2 11.2-51.2 17.6-75.2 24-96 46.4-193.6 70.4-289.6 1.6-6.4 3.2-11.2 12.8-9.6 88 12.8 176 32 257.6 70.4 30.4 14.4 59.2 32 83.2 57.6 17.6 19.2 32 40 33.6 67.2 1.6 35.2-16 59.2-41.6 80-28.8 24-60.8 40-96 52.8-62.4 22.4-126.4 36.8-190.4 41.6-41.6 3.2-83.2 3.2-123.2 4.8h-24z" fill="#E50012" p-id="2236"></path></svg>`,
		convenience: `<svg t="1766390615293" class="icon" viewBox="0 0 1091 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6978" width="300" height="300"><path d="M1062.093617 1024H0.744073V0h1061.349544v1024z m-535.343465-964.863222v3.112462H125.242553c-29.568389 0-45.130699 18.674772-42.018237 48.243161l23.343465 228.765958c7.781155 77.81155 15.56231 154.066869 23.343465 231.878419l28.012158 280.121581c3.112462 26.455927 4.668693 52.911854 9.337386 77.81155 4.668693 23.343465 18.674772 35.793313 43.574468 35.793313h166.516718c23.343465 0 23.343465 0 23.343465 23.343465 0 10.893617 3.112462 14.006079 14.006079 14.006079h233.43465c24.899696 0 24.899696 0 23.343465-23.343465 0-9.337386 1.556231-12.449848 12.449848-12.449848h163.404256c23.343465 0 42.018237-17.118541 45.130699-38.905775 7.781155-73.142857 15.56231-144.729483 23.343465-217.872341L943.820061 434.18845c10.893617-105.823708 21.787234-213.203647 32.680851-319.027356 3.112462-34.237082-15.56231-52.911854-48.243161-52.911854-135.392097-3.112462-269.227964-3.112462-401.507599-3.112462z" fill="#05774B" p-id="6979"></path><path d="M526.750152 59.136778h399.951368c34.237082 0 51.355623 18.674772 48.243161 52.911854-10.893617 105.823708-21.787234 213.203647-32.680851 319.027356L914.251672 706.528875c-7.781155 73.142857-15.56231 144.729483-23.343465 217.872341-3.112462 21.787234-21.787234 38.905775-45.130699 38.905775H682.373252c-10.893617 0-12.449848 3.112462-12.449848 12.449848 1.556231 23.343465 0 23.343465-23.343465 23.343465h-233.43465c-10.893617 0-14.006079-3.112462-14.006079-14.006079 0-23.343465 0-23.343465-23.343465-23.343465H209.279027c-23.343465 0-38.905775-12.449848-43.574468-35.793313-4.668693-26.455927-6.224924-52.911854-9.337386-77.81155l-28.012158-280.121581c-7.781155-77.81155-15.56231-154.066869-23.343465-231.878419L81.668085 107.379939c-1.556231-26.455927 14.006079-45.130699 43.574468-45.130699h401.507599v-3.112462z m317.471125 90.261398c-98.042553 29.568389-174.297872 87.148936-244.328268 155.623101-66.917933 65.361702-110.492401 143.173252-135.392097 233.43465 1.556231 0 3.112462 1.556231 4.668693 1.556231h210.091185c6.224924 0 7.781155-4.668693 9.337386-9.337386 6.224924-17.118541 12.449848-35.793313 21.787234-52.911854 29.568389-51.355623 73.142857-87.148936 124.498481-113.604863 7.781155-4.668693 10.893617-7.781155 10.893617-17.118541V158.735562c0-1.556231 0-3.112462-1.556231-9.337386z m-82.480244 9.337386v-1.556231h-513.556231c-15.56231 0-15.56231 0-15.56231 15.56231v154.06687c0 15.56231 0 15.56231 15.56231 15.56231h275.452888c9.337386 0 17.118541-3.112462 23.343465-10.893617 46.68693-54.468085 99.598784-101.155015 160.291793-140.060791 15.56231-10.893617 35.793313-21.787234 54.468085-32.680851z m-108.93617 823.246201c1.556231-84.036474 4.668693-168.072948 6.224924-252.109423H445.82614c-10.893617 0-14.006079 3.112462-14.006079 12.449848l-14.006079 191.416414c-1.556231 15.56231 0 32.680851 0 49.799392 79.367781-1.556231 157.179331-1.556231 234.990881-1.556231z m93.37386-424.851064v155.6231h45.130699v-85.592705c0-9.337386 0-17.118541 1.556231-26.455927 1.556231-4.668693 7.781155-9.337386 12.449849-9.337386 3.112462 0 7.781155 6.224924 10.893617 10.893617 1.556231 3.112462 0 7.781155 0 10.893617V712.753799h45.130699v-6.224924-108.93617c0-7.781155-1.556231-15.56231-3.112462-21.787234-3.112462-10.893617-7.781155-18.674772-20.231003-20.231003-15.56231-3.112462-29.568389 0-40.462006 10.893617-1.556231 1.556231-4.668693 4.668693-7.781156 6.224924 0-6.224924-1.556231-10.893617-1.556231-14.006079-12.449848-1.556231-26.455927-1.556231-42.018237-1.556231z m-115.161094-1.556231h-20.231003c-7.781155 0-12.449848 1.556231-14.006079 10.893617-1.556231 14.006079-4.668693 26.455927-6.224924 40.462006l-9.337386 60.693009c-3.112462-3.112462-4.668693-4.668693-4.668693-7.781155-4.668693-31.12462-9.337386-62.24924-14.006079-91.817629 0-3.112462-3.112462-9.337386-4.668693-9.337386-14.006079-1.556231-29.568389 0-43.574468 0v6.224924c6.224924 46.68693 14.006079 93.37386 20.231003 140.06079 1.556231 6.224924 4.668693 7.781155 10.893617 7.781155h51.355623c7.781155 0 10.893617-3.112462 12.449848-9.337386 3.112462-23.343465 7.781155-48.243161 10.893617-71.586626 3.112462-24.899696 6.224924-49.799392 10.893617-76.255319z m96.486322 0h-84.036474v154.066869H727.503951v-31.12462h-35.793313v-23.343465c0-6.224924 1.556231-7.781155 7.781155-7.781155h21.787234c3.112462 0 6.224924-3.112462 7.781155-6.224924 1.556231-7.781155 0-15.56231 0-26.455927h-35.793313v-29.568389h35.793313c-1.556231-9.337386-1.556231-18.674772-1.556231-29.568389z m-225.653495 60.693009h-37.349544v-17.118541c-1.556231-7.781155 3.112462-10.893617 10.893617-10.893617h26.455927v-31.12462h-84.036474v154.066869h82.480243v-31.12462h-35.793313v-21.787234c0-7.781155 1.556231-10.893617 9.337386-9.337386h26.455927c1.556231-12.449848 1.556231-21.787234 1.556231-32.680851z m-281.677812-60.693009v154.066869h82.480244v-31.12462h-35.793314v-23.343465c0-6.224924 3.112462-9.337386 9.337386-7.781155h26.455928v-31.12462h-28.012159c-3.112462 0-7.781155-3.112462-7.781155-4.668693-1.556231-7.781155 0-14.006079 0-23.343465h29.56839c3.112462 0 7.781155-3.112462 7.781155-6.224924 1.556231-7.781155 0-17.118541 0-26.455927h-84.036475z m150.954408 1.556231H322.883891v147.841945c0 1.556231 3.112462 6.224924 4.668693 6.224924h76.255319v-31.12462H369.570821c1.556231-42.018237 1.556231-82.480243 1.556231-122.942249z m347.039513 174.297872c-20.231003 0-35.793313 14.006079-35.793313 32.680851 0 18.674772 15.56231 34.237082 34.237082 35.793314 20.231003 0 34.237082-14.006079 34.237082-34.237083 0-18.674772-14.006079-34.237082-32.680851-34.237082z" fill="#FFFFFF" p-id="6980"></path><path d="M844.221277 149.398176c0 4.668693 1.556231 7.781155 1.556231 9.337386v188.303952c0 9.337386-3.112462 14.006079-10.893617 17.118541-51.355623 26.455927-94.930091 63.805471-124.498481 113.604863-9.337386 17.118541-15.56231 35.793313-21.787234 52.911854-1.556231 4.668693-3.112462 9.337386-9.337386 9.337386H469.169605c-1.556231 0-1.556231 0-4.668693-1.556231 24.899696-90.261398 68.474164-168.072948 135.392097-233.43465 70.030395-68.474164 147.841945-126.054711 244.328268-155.623101z" fill="#E3011E" p-id="6981"></path><path d="M761.741033 158.735562l-56.024316 32.680851c-59.136778 38.905775-113.604863 85.592705-160.291793 140.060791-6.224924 7.781155-12.449848 10.893617-23.343465 10.893617H246.628571c-15.56231 0-15.56231 0-15.56231-15.56231v-154.06687c0-15.56231 0-15.56231 15.56231-15.56231h513.556231l1.556231 1.556231z" fill="#F08200" p-id="6982"></path><path d="M652.804863 981.981763H417.813982c0-17.118541-1.556231-32.680851 0-49.799392l14.006079-191.416414c0-9.337386 4.668693-12.449848 14.006079-12.449848h213.203647c-1.556231 85.592705-4.668693 169.629179-6.224924 253.665654z" fill="#E5001F" p-id="6983"></path><path d="M746.178723 557.130699H789.753191c0 4.668693 1.556231 9.337386 1.556231 14.006079 3.112462-3.112462 6.224924-4.668693 7.781156-6.224924 10.893617-10.893617 24.899696-14.006079 40.462006-10.893617 10.893617 1.556231 17.118541 9.337386 20.231003 20.231003 1.556231 7.781155 3.112462 15.56231 3.112462 21.787234v115.161094h-45.130699V698.74772v-87.148936c0-3.112462 1.556231-7.781155 0-10.893617-3.112462-4.668693-6.224924-10.893617-10.893617-10.893617-4.668693 0-10.893617 4.668693-12.449849 9.337386-3.112462 7.781155-1.556231 17.118541-1.556231 26.455927v85.592705h-45.130699c-1.556231-51.355623-1.556231-102.711246-1.556231-154.066869zM631.017629 555.574468c-3.112462 26.455927-7.781155 49.799392-10.893617 74.699088-3.112462 23.343465-7.781155 48.243161-10.893617 71.586626-1.556231 7.781155-4.668693 9.337386-12.449848 9.337386h-51.355623c-4.668693 0-9.337386 0-10.893617-7.781155-6.224924-46.68693-14.006079-93.37386-20.231003-140.06079v-6.224924h43.574468c1.556231 0 4.668693 6.224924 4.668693 9.337386 4.668693 31.12462 9.337386 62.24924 14.006079 91.817629 0 3.112462 1.556231 4.668693 4.668693 7.781155l9.337386-60.693009c1.556231-14.006079 4.668693-26.455927 6.224924-40.462006 1.556231-9.337386 4.668693-10.893617 14.006079-10.893617 6.224924 3.112462 12.449848 1.556231 20.231003 1.556231zM727.503951 555.574468v31.12462h-35.793313v29.568389H727.503951v26.455927c0 1.556231-4.668693 6.224924-7.781155 6.224924-7.781155 1.556231-14.006079 0-21.787234 0-6.224924 0-7.781155 1.556231-7.781155 7.781155v23.343465h35.793313v31.12462h-84.036474v-154.066869c29.568389-1.556231 57.580547-1.556231 85.592705-1.556231zM501.850456 616.267477v31.12462h-26.455927c-7.781155 0-9.337386 3.112462-9.337386 9.337386v21.787234h35.793313v31.12462h-82.480243v-154.066869h84.036474v31.12462h-26.455927c-7.781155 0-12.449848 3.112462-10.893617 10.893617v17.118541c12.449848 1.556231 23.343465 1.556231 35.793313 1.556231zM220.172644 555.574468h84.036475v26.455927c0 1.556231-4.668693 4.668693-7.781155 6.224924h-29.56839v23.343465c0 1.556231 4.668693 4.668693 7.781155 4.668693h28.012159v31.12462H276.19696c-6.224924 0-9.337386 1.556231-9.337386 7.781155v23.343465h35.793314v31.12462h-82.480244v-154.066869zM371.127052 557.130699v122.942249h34.237082v31.12462h-76.255319c-1.556231 0-4.668693-3.112462-4.668693-6.224924v-147.841945h46.68693z" fill="#05774B" p-id="6984"></path><path d="M718.166565 731.428571c20.231003 0 34.237082 15.56231 34.237082 34.237082 0 20.231003-15.56231 34.237082-34.237082 34.237083-20.231003 0-35.793313-15.56231-34.237082-35.793314-1.556231-18.674772 14.006079-32.680851 34.237082-32.680851z m28.012158 34.237082c0-15.56231-12.449848-29.568389-28.012158-29.568389s-29.568389 12.449848-29.568389 29.568389c0 15.56231 12.449848 29.568389 29.568389 29.56839 14.006079 0 28.012158-12.449848 28.012158-29.56839z" fill="" p-id="6985"></path><path d="M746.178723 765.665653c0 17.118541-12.449848 29.568389-29.568389 29.56839-15.56231 0-29.568389-14.006079-29.568389-29.56839 0-15.56231 14.006079-29.568389 29.568389-29.568389 17.118541 0 29.568389 14.006079 29.568389 29.568389z m-42.018237 18.674773c1.556231 0 1.556231 0 3.112462 1.556231 0-3.112462 0-6.224924 1.556231-7.781155 0-3.112462 1.556231-6.224924 3.112462-9.337386 3.112462 1.556231 6.224924 3.112462 7.781155 6.224924 3.112462 3.112462 6.224924 7.781155 9.337386 12.449848 1.556231 0 1.556231-1.556231 3.112462-1.556231-3.112462-4.668693-6.224924-9.337386-9.337386-15.56231 7.781155-3.112462 12.449848-7.781155 7.781155-15.562311-6.224924-10.893617-17.118541-6.224924-26.455927-6.224924v35.793314z" fill="#FFFFFF" p-id="6986"></path><path d="M704.160486 784.340426v-37.349545c9.337386 0 20.231003-4.668693 26.455927 6.224924 4.668693 7.781155 0 12.449848-7.781155 15.562311 3.112462 6.224924 6.224924 10.893617 9.337386 15.56231-1.556231 0-1.556231 1.556231-3.112462 1.556231-3.112462-4.668693-6.224924-7.781155-9.337386-12.449848-1.556231-3.112462-4.668693-4.668693-7.781155-6.224925-1.556231 3.112462-1.556231 6.224924-3.112462 9.337387 0 3.112462-1.556231 6.224924-1.556231 7.781155h-3.112462z m4.668693-35.793314c0 7.781155 0 10.893617 1.556231 17.118541 6.224924-1.556231 10.893617-3.112462 15.56231-4.668693 1.556231 0 1.556231-6.224924 0-6.224924-4.668693-3.112462-9.337386-4.668693-17.118541-6.224924z" fill="" p-id="6987"></path><path d="M708.829179 748.547112c7.781155 1.556231 12.449848 3.112462 17.118541 6.224924v6.224924c-4.668693 1.556231-9.337386 3.112462-15.56231 4.668693 0-6.224924-1.556231-10.893617-1.556231-17.118541z" fill="#FFFFFF" p-id="6988"></path></svg>`,
		bank: `<svg t="1766390676502" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11099" width="300" height="300"><path d="M190.746 512.006c0-175.318 140.422-317.809 314.919-321.187v-6.744c-41.376-16.941-86.65-26.316-134.126-26.316-195.644 0-354.241 158.595-354.241 354.239 0 195.645 158.597 354.245 354.241 354.245 47.477 0 92.75-9.375 134.126-26.318v-6.746c-174.498-3.378-314.919-145.866-314.919-321.173zM652.459 157.758c-47.475 0-92.748 9.375-134.123 26.314v6.746c174.494 3.378 314.918 145.869 314.918 321.187 0 175.307-140.424 317.795-314.918 321.172v6.746c41.375 16.943 86.648 26.318 134.123 26.318 195.646 0 354.244-158.6 354.244-354.245 0-195.643-158.598-354.238-354.244-354.238z" fill="#D13531" p-id="11100"></path><path d="M654.229 511.998c0-78.551-63.674-142.227-142.229-142.227-78.554 0-142.229 63.675-142.229 142.227 0 78.553 63.674 142.229 142.229 142.229s142.229-63.676 142.229-142.229z" fill="#D13531" p-id="11101"></path></svg>`,
		lock: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
		shipping: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
		package: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
		user: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
		phone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
		mapPin: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
		calendar: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
	};

	// 状态管理
	let selectedAddress = $state<number>(1);
	let selectedPayment = $state<string>('paypay');
	let step = $state<'address' | 'payment' | 'confirm'>('address');
	let isProcessing = $state<boolean>(false);

	// 地址数据
	const addresses = [
		{
			id: 1,
			name: '自宅',
			recipient: '山田 太郎',
			phone: '080-1234-5678',
			address: '〒150-0001 東京都渋谷区神宮前1-1-1',
			postalCode: '150-0001',
			isDefault: true
		},
		{
			id: 2,
			name: '会社',
			recipient: '山田 太郎',
			phone: '03-1234-5678',
			address: '〒100-0005 東京都千代田区丸の内1-1-1',
			postalCode: '100-0005',
			isDefault: false
		}
	];

	// 支付方式
	const paymentMethods = [
		{
			id: 'paypay',
			name: 'PayPay',
			icon: icons.paypay,
			description: 'PayPay残高で決済',
			fee: 0
		},
		{
			id: 'credit',
			name: 'クレジットカード',
			icon: icons.creditCard,
			description: 'VISA/Mastercard',
			fee: 0
		},
		{
			id: 'convenience',
			name: 'コンビニ決済',
			icon: icons.convenience,
			description: 'ローソン/ファミマなど',
			fee: 200
		},
		{
			id: 'bank',
			name: '銀行振込',
			icon: icons.bank,
			description: '三井住友/三菱UFJなど',
			fee: 300
		}
	];

	// 订单数据
	let orderItems = $state([
		{
			id: 1,
			name: 'ワイヤレスイヤホン Pro',
			image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
			price: 12800,
			quantity: 1,
			color: 'ブラック',
			seller: 'テックストア'
		},
		{
			id: 2,
			name: 'スマートウォッチ Series 5',
			image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
			price: 28900,
			quantity: 1,
			color: 'シルバー',
			size: '42mm',
			seller: 'ガジェット専門店'
		}
	]);

	// 计算价格
	let subtotal = $derived(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
	let shippingFee = $state(500);
	let paymentFee = $derived(paymentMethods.find((m) => m.id === selectedPayment)?.fee || 0);
	let total = $derived(subtotal + shippingFee + paymentFee);

	// 格式化价格
	function formatPrice(price: number): string {
		return `¥${price.toLocaleString('ja-JP')}`;
	}

	// 选择支付方式
	function selectPayment(methodId: string) {
		selectedPayment = methodId;
	}

	// 步骤导航
	function nextStep() {
		if (step === 'address') {
			step = 'payment';
		} else if (step === 'payment') {
			step = 'confirm';
		}
		// 滚动到顶部
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function prevStep() {
		if (step === 'payment') {
			step = 'address';
		} else if (step === 'confirm') {
			step = 'payment';
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// 确认订单
	async function confirmOrder() {
		isProcessing = true;

		// 创建订单数据
		const orderData = {
			orderId: `ORD-${Date.now()}`,
			items: orderItems,
			address: addresses.find((a) => a.id === selectedAddress),
			payment: paymentMethods.find((m) => m.id === selectedPayment),
			subtotal,
			shippingFee,
			paymentFee,
			total,
			orderDate: new Date().toISOString()
		};

		// 保存到 localStorage 以便后续页面使用
		localStorage.setItem('currentOrder', JSON.stringify(orderData));

		// 模拟API调用
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// 根据支付方式跳转
		if (selectedPayment === 'paypay') {
			goto('/checkout/payment');
		} else if (selectedPayment === 'credit') {
			goto('/checkout/payment');
		} else {
			goto('/checkout/success');
		}
	}

	// 返回购物车
	function backToCart() {
		goto('/cart');
	}

	// 获取选中的地址
	const selectedAddressData = $derived(addresses.find((a) => a.id === selectedAddress));

	// 获取选中的支付方式
	const selectedPaymentData = $derived(paymentMethods.find((m) => m.id === selectedPayment));
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<!-- 页面标题 -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">購入手続き</h1>
			<p class="mt-1 text-sm text-gray-500">注文の詳細を確認してください</p>
		</div>

		<!-- 步骤指示器 -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<!-- 步骤1: 地址 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'address'
								? 'bg-gray-900 text-white'
								: step === 'payment' || step === 'confirm'
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
					>
						{#if step === 'payment' || step === 'confirm'}
							{@html icons.check}
						{:else}
							1
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お届け先</span>
				</div>

				<div
					class={`h-1 w-12 transition-colors sm:w-24 ${
						step === 'payment' || step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
					}`}
				></div>

				<!-- 步骤2: 支付 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'payment'
								? 'bg-gray-900 text-white'
								: step === 'confirm'
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
						}`}
					>
						{#if step === 'confirm'}
							{@html icons.check}
						{:else}
							2
						{/if}
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">お支払い方法</span>
				</div>

				<div
					class={`h-1 w-12 transition-colors sm:w-24 ${
						step === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
					}`}
				></div>

				<!-- 步骤3: 确认 -->
				<div class="flex items-center gap-2">
					<div
						class={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
							step === 'confirm' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
						}`}
					>
						3
					</div>
					<span class="hidden text-sm font-medium text-gray-900 sm:inline">確認</span>
				</div>
			</div>
		</div>

		<div class="grid gap-8 lg:grid-cols-3">
			<!-- 左侧：主要内容 -->
			<div class="lg:col-span-2">
				{#if step === 'address'}
					<!-- 地址选择 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-lg font-semibold text-gray-900">お届け先住所</h2>
							<button
								class="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
							>
								{@html icons.add}
								<span>新しい住所を追加</span>
							</button>
						</div>

						<div class="space-y-4">
							{#each addresses as address}
								<label class="block cursor-pointer">
									<div
										class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedAddress ===
										address.id
											? 'border-gray-900 bg-gray-50'
											: 'border-gray-200'}"
									>
										<div class="flex items-start gap-3">
											<input
												type="radio"
												name="address"
												value={address.id}
												bind:group={selectedAddress}
												class="mt-1"
											/>
											<div class="flex-1">
												<div class="mb-2 flex items-center gap-2">
													<span class="text-sm font-medium text-gray-900">{address.name}</span>
													{#if address.isDefault}
														<span class="rounded bg-gray-900 px-2 py-0.5 text-xs text-white">
															既定
														</span>
													{/if}
												</div>
												<div class="space-y-1 text-sm text-gray-600">
													<div class="flex items-center gap-2">
														{@html icons.user}
														<span>{address.recipient}</span>
													</div>
													<div class="flex items-center gap-2">
														{@html icons.phone}
														<span>{address.phone}</span>
													</div>
													<div class="flex items-start gap-2">
														{@html icons.mapPin}
														<span>{address.address}</span>
													</div>
												</div>
											</div>
											<button
												class="flex items-center gap-1 text-gray-400 transition-colors hover:text-gray-600"
											>
												{@html icons.edit}
											</button>
										</div>
									</div>
								</label>
							{/each}
						</div>

						<div class="mt-6 flex justify-end">
							<button
								onclick={nextStep}
								class="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							>
								次へ進む
							</button>
						</div>
					</div>
				{:else if step === 'payment'}
					<!-- 支付方式选择 -->
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 class="mb-6 text-lg font-semibold text-gray-900">お支払い方法</h2>

						<div class="space-y-4">
							{#each paymentMethods as method}
								<label class="block cursor-pointer">
									<div
										class="rounded-lg border-2 p-4 transition-all hover:border-gray-400 {selectedPayment ===
										method.id
											? 'border-gray-900 bg-gray-50'
											: 'border-gray-200'}"
									>
										<div class="flex items-start gap-3">
											<input
												type="radio"
												name="payment"
												value={method.id}
												bind:group={selectedPayment}
												onchange={() => selectPayment(method.id)}
												class="mt-1"
											/>
											<div class="flex-1">
												<div
													class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
												>
													<div class="flex items-center gap-3">
														<div
															class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"
														>
															{@html method.icon}
														</div>
														<div>
															<h3 class="font-medium text-gray-900">{method.name}</h3>
															<p class="text-sm text-gray-500">{method.description}</p>
														</div>
													</div>
													<div class="text-sm">
														{#if method.fee > 0}
															<span class="text-gray-500">手数料: {formatPrice(method.fee)}</span>
														{:else}
															<span class="font-medium text-green-600">手数料無料</span>
														{/if}
													</div>
												</div>
											</div>
										</div>
									</div>
								</label>
							{/each}
						</div>

						<!-- 安全提示 -->
						<div class="mt-6 rounded-lg bg-blue-50 p-4">
							<div class="flex items-start gap-3">
								<div class="text-blue-600">
									{@html icons.lock}
								</div>
								<div>
									<h4 class="text-sm font-medium text-blue-900">安全な決済</h4>
									<p class="mt-1 text-xs text-blue-700">
										SSL暗号化により、お客様の決済情報は安全に保護されています。当社はクレジットカード情報を保持しません。
									</p>
								</div>
							</div>
						</div>

						<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
							<button
								onclick={prevStep}
								class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
							>
								戻る
							</button>
							<button
								onclick={nextStep}
								class="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
							>
								次へ進む
							</button>
						</div>
					</div>
				{:else if step === 'confirm'}
					<!-- 订单确认 -->
					<div class="space-y-6">
						<!-- 配送信息 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-base font-semibold text-gray-900">配送情報</h3>
								<button
									onclick={() => (step = 'address')}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedAddressData}
								<div class="space-y-3 text-sm text-gray-600">
									<div class="flex items-center gap-2">
										{@html icons.user}
										<span class="font-medium text-gray-900">{selectedAddressData.recipient}</span>
									</div>
									<div class="flex items-center gap-2">
										{@html icons.phone}
										<span>{selectedAddressData.phone}</span>
									</div>
									<div class="flex items-start gap-2">
										{@html icons.mapPin}
										<span>{selectedAddressData.address}</span>
									</div>
									<div class="flex items-center gap-2">
										{@html icons.calendar}
										<span>通常1-3営業日でお届け</span>
									</div>
								</div>
							{/if}
						</div>

						<!-- 支付信息 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-base font-semibold text-gray-900">お支払い方法</h3>
								<button
									onclick={() => (step = 'payment')}
									class="text-sm text-blue-600 transition-colors hover:text-blue-800"
								>
									変更
								</button>
							</div>
							{#if selectedPaymentData}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
											{@html selectedPaymentData.icon}
										</div>
										<div>
											<p class="text-sm font-medium text-gray-900">{selectedPaymentData.name}</p>
											<p class="text-xs text-gray-500">{selectedPaymentData.description}</p>
										</div>
									</div>
									<div class="text-sm">
										{#if selectedPaymentData.fee > 0}
											<span class="text-gray-500"
												>手数料: {formatPrice(selectedPaymentData.fee)}</span
											>
										{:else}
											<span class="font-medium text-green-600">手数料無料</span>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- 商品列表 -->
						<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 class="mb-4 text-base font-semibold text-gray-900">注文商品</h3>
							<div class="space-y-4">
								{#each orderItems as item}
									<div class="flex items-center gap-4">
										<img
											src={item.image}
											alt={item.name}
											class="h-20 w-20 rounded-lg border border-gray-200 object-cover"
										/>
										<div class="flex-1">
											<p class="font-medium text-gray-900">{item.name}</p>
											<div
												class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"
											>
												{#if item.color}
													<span>カラー: {item.color}</span>
												{/if}
												{#if item.size}
													<span>サイズ: {item.size}</span>
												{/if}
												<span>販売元: {item.seller}</span>
											</div>
										</div>
										<div class="text-right">
											<p class="text-sm font-medium text-gray-900">
												{formatPrice(item.price)}
											</p>
											<p class="text-xs text-gray-500">数量: {item.quantity}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- 操作按钮 -->
						<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
							<button
								onclick={prevStep}
								disabled={isProcessing}
								class="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								戻る
							</button>
							<button
								onclick={confirmOrder}
								disabled={isProcessing}
								class="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isProcessing}
									<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									<span>処理中...</span>
								{:else}
									<span>注文を確定する</span>
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- 右侧：订单摘要 -->
			<div class="lg:col-span-1">
				<div class="sticky top-4">
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h3 class="mb-4 text-base font-semibold text-gray-900">注文概要</h3>

						<!-- 商品预览（移动端隐藏） -->
						<div class="mb-4 hidden space-y-3 border-b border-gray-200 pb-4 lg:block">
							{#each orderItems.slice(0, 2) as item}
								<div class="flex items-center gap-3">
									<img
										src={item.image}
										alt={item.name}
										class="h-12 w-12 rounded border border-gray-200 object-cover"
									/>
									<div class="flex-1">
										<p class="text-xs text-gray-900">{item.name}</p>
										<p class="text-xs text-gray-500">×{item.quantity}</p>
									</div>
								</div>
							{/each}
							{#if orderItems.length > 2}
								<p class="text-xs text-gray-500">他 {orderItems.length - 2} 点</p>
							{/if}
						</div>

						<div class="space-y-3 text-sm">
							<div class="flex justify-between text-gray-600">
								<span>小計 ({orderItems.length}点)</span>
								<span class="font-medium">{formatPrice(subtotal)}</span>
							</div>
							<div class="flex justify-between text-gray-600">
								<span>送料</span>
								<span class="font-medium"
									>{shippingFee === 0 ? '無料' : formatPrice(shippingFee)}</span
								>
							</div>
							{#if paymentFee > 0}
								<div class="flex justify-between text-gray-600">
									<span>決済手数料</span>
									<span class="font-medium">{formatPrice(paymentFee)}</span>
								</div>
							{/if}
							<div class="border-t border-gray-200 pt-3">
								<div class="flex justify-between text-lg font-bold text-gray-900">
									<span>合計金額</span>
									<span>{formatPrice(total)}</span>
								</div>
								<p class="mt-1 text-xs text-gray-500">（税込み）</p>
							</div>
						</div>

						<button
							onclick={backToCart}
							class="mt-6 w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							カートに戻る
						</button>
					</div>

					<!-- 安全保证 -->
					<div class="mt-4 rounded-lg bg-gray-50 p-4">
						<div class="space-y-3">
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.lock}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">SSL暗号化通信</span>
									<p class="mt-0.5">すべての通信は暗号化されています</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.shipping}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">配送保証</span>
									<p class="mt-0.5">商品未着時は全額返金保証</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<div class="text-gray-600">
									{@html icons.package}
								</div>
								<div class="text-xs text-gray-600">
									<span class="font-medium text-gray-900">品質保証</span>
									<p class="mt-0.5">30日間返品保証</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	input[type='radio'] {
		accent-color: #111827;
	}

	.sticky {
		position: sticky;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
