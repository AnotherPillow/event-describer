<script lang="ts">
    import Describer from "$lib/components/Describer.svelte";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import type { OutputFormat } from "$lib/types";
    import * as Select from "$lib/components/ui/select/index.js";
    import ModeToggle from "$lib/components/ModeToggle.svelte";
    import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
    import { Input } from "$lib/components/ui/input/index.js";

    let inputData = $state('')
    let modID = $state('')
    let outputFormat = $state<OutputFormat>('markdown')
    let submitTrigger = $state(0) // just there to make some state change

    function handleSubmit() {
        submitTrigger++
    }

    
</script>

<div class="flex min-h-screen w-full flex-col bg-zinc-600 text-center">
    <h1 class="text-xl font-bold">event describer</h1>
    <p>event go in and then you get text for wiki or whatever</p>

    <div class="absolute top-2 right-2">
        <ModeToggle />
    </div>

    <div class="flex flex-1 w-full gap-4">
        <div class="flex-1 bg-zinc-700 rounded-[8px]">
            <h2 class="text-lg">event json here</h2>
            
            <div class="w-full flex justify-center my-2 flex-row gap-4">
                <div>
                    <Select.Root type="single" bind:value={outputFormat}>
                        <Select.Trigger class="w-[180px] text-foreground">{outputFormat}</Select.Trigger>
                        <Select.Content>
                            <Select.Item value="markdown">Markdown</Select.Item>
                            <Select.Item value="bbcode">BBCode</Select.Item>
                            <Select.Item value="wikitext">Wikitext</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </div>
                <div>
                    <Input bind:value={modID} placeholder="modauthor.modname"/>
                </div>
                <div>
                    <Button size="icon" aria-label="Submit" variant="outline" class="cursor-pointer" onclick={handleSubmit}>
                        <ArrowRightIcon />
                    </Button>
                </div>
            </div>
            
            <div class="w-full flex justify-center h-8/10 my-2">
                <Textarea class="mx-2 rounded-[8px] font-mono" bind:value={inputData} placeholder="file containing event changes. Must have a Changes key"/>
            </div>
        </div>
        <div class="flex-1 bg-zinc-700 rounded-[8px]">
            <h2 class="text-lg">whatever formatted here</h2>
            <Describer {inputData} {outputFormat} {modID} {submitTrigger}/>
        </div>
    </div>
</div>
