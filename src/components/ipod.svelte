<script lang="ts">
  type GameState = {
    state:
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
      title: "Billie Jean",
      path: "/we-will-rock-you.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "We Will Rock You",
      path: "/we-will-rock-you.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "We Wish You a Merry Christmas",
      path: "/we-will-rock-you.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "ABC - Jacksons 5",
      path: "/we-will-rock-you.wav",
    },
    {
      id: crypto.randomUUID(),
      title: "Somebody That I Used to Know",
      path: "/we-will-rock-you.wav",
    },
  ]);

  let gameState = $state<GameState>({
    state: "main_menu",
    round: 0,
    score: 0,
  });

  let correct = $state(false);
  let isPlaying = $state(false);
  let player = $state() as HTMLAudioElement;

  const songs = [...songsData, songsData[0]];
  let currentSong = $derived(songs[gameState.round] || null);

  const selectedSongs = $derived.by(() => {
    if (!currentSong) return [];

    let songOptions = songs.filter((s) => s.id !== currentSong.id);
    songOptions = [...shuffle(songOptions.slice(0, 2)), currentSong];
    return shuffle(songOptions);
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

<section class="h-104mm w-62mm flex flex-col rounded-2xl b p-sm">
  <section class="aspect-5/4 rounded-md b relative text-sm">
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
          class="button-style">Back</button
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
        <li>
          <button
            type="button"
            class="button-style"
            onclick={() => (gameState.state = "tutorial_menu")}
            >How to Play</button
          >
        </li>
      {:else if gameState.state === "tutorial_menu"}
        <li>1. Connect actuator.</li>
        <li>2. Feel vibrations.</li>
        <li>3. Guess the song.</li>
      {:else if gameState.state === "post_game_menu"}
        <li>Game Over</li>

        {#if gameState.score === songs.length}
          <li>Congrats!</li>
        {/if}
        <li>
          You got {gameState.score}
          {gameState.score > 1 ? "points" : "point"}
        </li>
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
            gameState.state = "in_game";
          }}
          class="button-style"
        >
          Next Level
        </button>
      {:else if gameState.state === "post_game_menu"}
        <button
          type="button"
          onclick={() => {
            gameState = {
              state: "main_menu",
              round: 0,
              score: 0,
            };
          }}
          class="button-style">Back to Menu</button
        >
      {/if}
    </section>
  </section>

  <section class="grow grid place-content-center">
    <section class="size-36 rounded-full b p-4xl">
      <section class="size-full rounded-full grid place-content-center b">
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
            class={`size-10 ${isPlaying ? "i-ph:pause-thin" : "i-ph:play-thin"}`}
            aria-label="Play"
            onclick={() => {
              !isPlaying ? player.play() : player.pause();
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
