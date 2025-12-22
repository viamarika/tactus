<script lang="ts">
  import Instructions from "./instructions.svelte";

  type GameState = {
    state:
      | "instructions"
      | "main_menu"
      | "tutorial_menu"
      | "in_game"
      | "guess_result"
      | "post_game_menu";
    round: number;
    score: number;
  };

  type Songs = {
    id: string;
    title: string;
    path: string;
  };

  const shuffle = (songs: Songs[]) => {
    let len = songs.length;

    let t: Songs;
    let i: number = Infinity;

    while (len) {
      i = Math.floor(Math.random() * len--);
      t = songs[len];
      songs[len] = songs[i];
      songs[i] = t;
    }

    return songs;
  };

  const songsData: Songs[] = shuffle([
    {
      id: crypto.randomUUID(),
      title: "Seven Nation Army",
      path: "/seven-nation-army-melody.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "We Will Rock You",
      path: "/we-will-rock-you-beats.wav",
    },

    {
      id: crypto.randomUUID(),
      title: "Somebody That I Used to Know",
      path: "/somebody-that-i-used-to-know-melody.wav",
    },

    {
      id: crypto.randomUUID(),
      title: "Eye of the Tiger",
      path: "/eye-of-the-tiger-drums.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "We Wish You a Merry Christmas",
      path: "/we-wish-you-a-merry-christmas-melody.wav",
    },
  ]);

  const dummySongs: Songs[] = [
    { id: crypto.randomUUID(), title: "Jingle Bells", path: "" },
    { id: crypto.randomUUID(), title: "Smooth Criminal", path: "" },
    { id: crypto.randomUUID(), title: "Shape of You", path: "" },
    { id: crypto.randomUUID(), title: "Back to Black", path: "" },
    { id: crypto.randomUUID(), title: "Bohemian Rhapsody", path: "" },
  ];

  let gameState = $state<GameState>({
    state: "main_menu",
    round: 0,
    score: 0,
  });

  let isOpen = $state(false);

  let correct = $state(false);
  let isPlaying = $state(false);
  let player = $state() as HTMLAudioElement;

  const songs = [...songsData, songsData[0]];
  let currentSong = $derived(songs[gameState.round] || null);

  const selectedSongs = $derived.by(() => {
    if (!currentSong) return [];

    const allOptions = [...songsData, ...dummySongs];
    const incorrectOptions = allOptions.filter((s) => s.id !== currentSong.id);

    const distractors = shuffle(incorrectOptions).slice(0, 2);

    return shuffle([currentSong, ...distractors]);
  });

  const handleGuess = (id: Songs["id"]) => {
    if (id === currentSong.id) {
      gameState.score += 1;
      correct = true;
    } else {
      correct = false;
    }

    if (gameState.round === songs.length - 1) {
      gameState.state = "post_game_menu";
    } else {
      gameState.state = "guess_result";
    }
  };
</script>

<button class="absolute bottom-0 m-xs b-b" popovertarget="instructions">
  {isOpen ? "Close" : "Instructions"}</button
>
<div
  id="instructions"
  popover
  class="relative m-auto pt-xs"
  ontoggle={(e) => {
    isOpen = (e.target as HTMLElement).matches(":popover-open");
  }}
>
  <Instructions />
</div>

<section class="h-104mm w-62mm flex flex-col rounded-2xl b p-sm bg-brand-ipod">
  <section
    class="aspect-5/4 rounded-md relative text-sm bg-white shadow-[0_0_4px_0_rgba(0,0,0,0.25)_inset]"
  >
    {#if gameState.state === "in_game" || gameState.state === "guess_result"}
      <section class="p-1 absolute w-full flex justify-between text-xs">
        <p>round {gameState.round + 1}</p>
        <p>{gameState.score} points</p>
      </section>
    {/if}

    <section class="absolute w-full">
      {#if gameState.state === "tutorial_menu"}
        <button
          type="button"
          onclick={() => (gameState.state = "main_menu")}
          class="button-style rounded-t-md">Back</button
        >
      {/if}
    </section>

    <ul class="size-full flex flex-col justify-center">
      {#if gameState.state === "main_menu"}
        <li>
          <button
            type="button"
            class="button-style"
            onclick={() => (gameState.state = "in_game")}>New Game</button
          >
        </li>
      {:else if gameState.state === "post_game_menu"}
        <li>Game Over</li>

        {#if gameState.score === songs.length}
          <li>Congrats!</li>
        {/if}
        <li>
          You got {gameState.score}
          {gameState.score > 1 ? "points" : "point"}
        </li>
      {:else if gameState.state === "thank_you"}
        <li class="mb-2">Thank you for participating!</li>
        <li>You may now close this window.</li>
      {:else if gameState.state === "in_game"}
        {#each selectedSongs as song}
          <li>
            <button
              type="button"
              onclick={() => handleGuess(song.id)}
              class="button-style">{song.title}</button
            >
          </li>
        {/each}
      {:else if correct}
        <li><b>Correct.</b></li>

        <li>You earned 1 point.</li>
      {:else}
        <li><b>Incorrect.</b></li>
        <li>You earned nothing.</li>
      {/if}
    </ul>

    <section class="absolute inset-x-0 bottom-0">
      {#if gameState.state === "guess_result"}
        <button
          type="button"
          onclick={() => {
            gameState.round += 1;
            isPlaying = false;
            gameState.state = "in_game";
          }}
          class="button-style rounded-b-md"
        >
          Next Level
        </button>
      {:else if gameState.state === "post_game_menu"}
        <button
          type="button"
          onclick={() => {
            gameState.state = "main_menu";
          }}
          class="button-style rounded-b-md">Back to Main Menu</button
        >
      {/if}
    </section>
  </section>

  <section class="grow grid place-content-center">
    <section class="size-36 rounded-full b p-4xl bg-white">
      <section
        class="size-full rounded-full grid place-content-center b bg-brand-ipod"
      >
        {#if gameState.state === "in_game"}
          <audio
            id="audio-source"
            src={currentSong.path}
            bind:this={player}
            loop
          ></audio>

          <!-- svelte-ignore element_invalid_self_closing_tag -->
          <button
            type="button"
            class={`size-14 ${isPlaying ? "i-mdi:pause" : "i-mdi:play"} bg-white`}
            aria-label="Play"
            onclick={() => {
              (!isPlaying ? player.play() : player.pause(),
                (player.currentTime = 0));

              isPlaying = !isPlaying;
            }}
          />
        {/if}
      </section>
    </section>
  </section>
</section>

<style>
  .button-style {
    --uno: "hover:(bg-brand-hover text-white) focus:(bg-brand-hover text-white outline-0) w-full text-align-left px-1";
  }

  li:not(:has(button)) {
    --uno: "px-1";
  }
</style>
