<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
    import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
   <meta content="Event Describer" property="og:title" />
    <meta content="https://event-describer.pillow.rocks/puffernotes.png" property="og:image" />
    <meta content="Automatically generate documentation for your Stardew Valley events by uploading their JSON source" property="og:description" />
    <meta content="https://event-describer.pillow.rocks" property="og:url" />
    <meta content="#FF2C29" name="theme-color" />
    <meta property="og:type" content="website" />
</svelte:head> 

<ModeWatcher />
{@render children()}
