<script lang="ts">
    import type { OutputFormat } from "$lib/types";
    import { untrack } from "svelte";
    import { Textarea } from "./ui/textarea";
    import JSON5 from 'json5'
    import describeEvent from "$lib/main-describer";

    let outputData = $state('')
    let mounted = $state(false)

    let { 
        inputData = '', 
        modID = '',
        outputFormat = 'markdown',
        submitTrigger = 0
    }: {
        inputData: string, 
        modID: string, 
        outputFormat: OutputFormat,
        submitTrigger: number
    } = $props();

    
    $effect(() => {
        submitTrigger;

        if (!mounted) {
            mounted = true
            return
        }

        untrack(() => {
            let parsed;
            try {
                parsed = JSON5.parse(
                    inputData
                        .replaceAll("\r\n", "\n") // just dont make me bother with them
                        .replaceAll(/\s+\/\/[^\n]*?\n/g, "") // remove // comments (and their next newline)
                        .replaceAll("\n", "") // remove newlines so that multi-line strings can work (newtonsoft accepts broken anywhere, json5 needs a backslash before them)
                )
            } catch (e) {console.log(e)}
            if (!parsed || (typeof parsed == 'object' && !parsed.Changes)) 
                return (outputData = 'failed to parse json (is it a content patcher file?) (make sure to press the button to do the things!)')
            
            const described = describeEvent(parsed, outputFormat, modID)
            
            // outputData = inputData + outputFormat
            outputData = described
            // outputData = 'fine'
        })
    })

</script>

<div class="w-full flex justify-center h-9/10 my-2">
    {#if !inputData || !inputData.startsWith('{')}
        <p class="text-destructive">please provide input json file</p>
    {:else if !modID}
        <p class="text-destructive">please provide your mods unique id</p>
    {:else}
        <Textarea class="mx-2 rounded-[8px] font-mono" value={outputData}/>
    {/if}
</div>