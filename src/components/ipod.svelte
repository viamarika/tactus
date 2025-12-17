<script lang="ts">
  import Instructions from "./instructions.svelte";

  type GameState = {
    state:
      | "consent_form"
      | "pre_game_survey"
      | "instructions"
      | "main_menu"
      | "tutorial_menu"
      | "in_game"
      | "guess_result"
      | "post_game_menu"
      | "post_game_survey"
      | "thank_you";
    round: number;
    score: number;
  };

  type Songs = {
    id: string;
    title: string;
    path: string;
  };

  type ConsentData = {
    date: string;
    consent: string;
  };

  type PreData = {
    age: number;
    hasMusicExperience: boolean | null;
    musicExperience: string[];
    hasRhythmExperience: boolean | null;
    rhythmExperience: string[];
    songFamiliarity: { title: string; isKnown: boolean }[];
  };

  type PostData = {
    difficulty: string;
    vibrationsClarity: string;
    enjoyment: string;
    additionalComments: string;
  };

  type Results = {
    id: string;
    consent: ConsentData[];
    preSurvey: PreData[];
    guessResults: { title: string; isCorrect: boolean; guessedSong: string }[];
    postSurvey: PostData[];
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

  const dummyData = shuffle([...dummySongs, ...songsData]);

  let gameState = $state<GameState>({
    state: "consent_form",
    round: 0,
    score: 0,
  });

  let results = $state<Results>({
    id: crypto.randomUUID(),
    consent: [],
    preSurvey: [],
    guessResults: [],
    postSurvey: [],
  });

  let consentData = $state({
    date: new Date().toISOString().split("T")[0],
    consent: "",
  });

  let preData = $state<PreData>({
    age: 0,
    hasMusicExperience: null,
    musicExperience: [],
    hasRhythmExperience: null,
    rhythmExperience: [],
    songFamiliarity: [],
  });

  let postData = $state<PostData>({
    difficulty: "",
    vibrationsClarity: "",
    enjoyment: "",
    additionalComments: "",
  });

  let isOpen = $state(false);

  let hasPlayedInstr = $derived(preData.hasMusicExperience);

  let hasRhythmExperience = $derived(preData.hasRhythmExperience);

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

    results.guessResults = [
      ...results.guessResults,
      {
        title: currentSong.title,
        isCorrect: correct,
        guessedSong:
          songs.find((s) => s.id === id)?.title.toString() ||
          dummySongs.find((s) => s.id === id)?.title.toString() ||
          "error",
      },
    ];

    if (gameState.round === songs.length - 1) {
      gameState.state = "post_game_menu";
    } else {
      gameState.state = "guess_result";
    }
  };

  const sendResults = async (results: Results) => {
    const res = await fetch("/postData", {
      method: "POST",
      body: JSON.stringify(results),
    });

    if (!res.ok) {
      console.error("Error:", res.statusText);
    } else {
      await res.json();
      console.log("Success ", res.status);
    }
  };
</script>

{#if gameState.state === "consent_form"}
  <section class="text-justify max-w-prose flex flex-col gap-lg font-form">
    <h3><b>What is this study about?</b></h3>
    <p>
      Welcome to Tactus, a game that explores how effectively vibrotactile
      feedback can communicate musical information through the sense of touch.
      The game was developed as a project for the Haptic Interaction (HTI.470)
      course. Your participation will help evaluate the haptic signals created
      for the game.
    </p>

    <p>This study will take approximately 5-10 minutes.</p>

    <h3><b>Consent Form</b></h3>

    <p>
      I understand that participation in the study is voluntary and that I have
      the right not to participate and the right to withdraw at any time from
      the study without any penalty or consequences. I also understand that all
      the collected information and data will be confidential.
    </p>

    <form
      class="flex flex-col gap-lg"
      onsubmit={(e) => {
        e.preventDefault();
        if (consentData.consent === "Yes") {
          results.consent.push(consentData);
          gameState.state = "pre_game_survey";
        } else {
          alert("You must agree to participate to continue");
        }
      }}
    >
      <div class="flex justify-between">
        <label for="date">Date of the study:</label>
        <input type="date" name="date" bind:value={consentData.date} />
      </div>

      <div class="flex justify-between">
        <label for="consent">I agree to participate in experiment</label>
        <select name="consent" bind:value={consentData.consent} required>
          <option value="" class="hidden"></option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <button type="submit" class="b p-xs">Submit</button>
    </form>
  </section>
{:else if gameState.state === "pre_game_survey"}
  <form
    class="b flex flex-col p-xl gap-sm m-xl overflow-auto font-form"
    onsubmit={(e) => {
      e.preventDefault();
      results.preSurvey.push(preData);
      console.log("results ", results);

      gameState.state = "instructions";
    }}
  >
    <div class="p-b-xs gap-xs">
      <label for="age"><b>Your Age:</b></label>
      <input type="number" name="age" class="w-16" bind:value={preData.age} />
    </div>

    <div class="flex justify-between p-b-xs gap-xs">
      <label for="music-experience">
        <b>Have you played any musical instruments or attended music classes?</b
        >
      </label>
      <select
        class="flex justify-between"
        id="music-experience"
        bind:value={preData.hasMusicExperience}
        required
      >
        <option class="hidden"></option>
        <option value={true}>Yes</option>
        <option value={false}>No</option>
      </select>
    </div>

    {#if hasPlayedInstr}
      <div class="flex p-b-xs gap-xs">
        <label for="instrument-duration">
          <b>If yes, how many years of musical experience do you have?</b>
        </label>
        <input
          type="number"
          id="instrument-duration"
          class="w-16"
          min="0"
          bind:value={preData.musicExperience[1]}
        />
      </div>

      <label for="instrument-type">
        <b>Which instrument(s)?</b>
      </label>
      <input
        type="text"
        id="instrument-type"
        class="b"
        bind:value={preData.musicExperience[0]}
      />
    {/if}

    <div class="flex justify-between p-b-xs gap-xs">
      <label for="rhythm-experience">
        <b
          >Do you have experience with rhythm-based activities (e.g., dance,
          cheer)?</b
        >
      </label>
      <select
        id="rhythm-experience"
        class="flex justify-between"
        bind:value={preData.hasRhythmExperience}
        required
      >
        <option class="hidden"></option>
        <option value={true}>Yes</option>
        <option value={false}>No</option>
      </select>
    </div>

    {#if hasRhythmExperience}
      <div class="flex p-b-xs gap-xs">
        <label for="instrument-duration">
          <b>If yes, how many years of rhythm-based activities do you have?</b>
        </label>
        <input
          type="number"
          id="instrument-duration"
          class="w-16"
          min="0"
          bind:value={preData.rhythmExperience[1]}
        />
      </div>

      <label for="instrument-type">
        <b>Which activities?</b>
      </label>
      <input
        type="text"
        id="instrument-type"
        bind:value={preData.rhythmExperience[0]}
        class="b"
      />
    {/if}

    <p><b>Please answer Yes/No if you know the following songs:</b></p>

    <div class="flex flex-col gap-xl">
      {#each dummyData as song, index}
        <div class="flex justify-between b-b p-b-xs">
          <label for="song-{index}">{song.title}</label>

          <select
            id="song-{index}"
            name="song_{index}"
            class="flex justify-between"
            onchange={(e) => {
              preData.songFamiliarity[index] = {
                title: song.title,
                isKnown: e.currentTarget.value === "Yes",
              };
            }}
            required
          >
            <option class="hidden"></option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      {/each}
    </div>
    <button type="submit" class="b p-xs">Enter</button>
  </form>
{:else if gameState.state === "instructions"}
  <Instructions />
  <button
    onclick={() => (gameState.state = "main_menu")}
    class="b p-xs mt-xs font-form">Continue</button
  >
{:else if gameState.state === "post_game_survey"}
  <form
    class="b flex flex-col p-xl gap-sm m-xl overflow-auto font-form"
    onsubmit={(e) => {
      e.preventDefault();
      results.postSurvey.push(postData);
      sendResults(results);
      gameState = {
        state: "thank_you",
        round: 0,
        score: 0,
      };
    }}
  >
    <h3><b>Post-study survey</b></h3>

    <label for="difficulty">
      How difficult was it to identify songs through vibrations?
    </label>
    <select name="difficulty" id="difficulty" bind:value={postData.difficulty}>
      <option class="hidden"></option>

      <option value="very-easy">Very Easy</option>
      <option value="easy">Easy</option>
      <option value="neutral">Neutral</option>
      <option value="hard">Hard</option>
      <option value="very-hard">Very Hard</option>
    </select>

    <label for="clarity"> How clear were the vibration patterns? </label>
    <select name="clarity" id="clarity" bind:value={postData.vibrationsClarity}>
      <option class="hidden"></option>
      <option value="very-clear">Very Clear</option>
      <option value="clear">Clear</option>
      <option value="neutral">Neutral</option>
      <option value="unclear">Unclear</option>
      <option value="very-unclear">Very Unclear</option>
    </select>

    <label for="enjoyment"> How enjoyable was the experience? </label>
    <select name="enjoyment" id="enjoyment" bind:value={postData.enjoyment}>
      <option class="hidden"></option>

      <option value="very-enjoyable">Very Enjoyable</option>
      <option value="enjoyable">Enjoyable</option>
      <option value="neutral">Neutral</option>
      <option value="not-enjoyable">Not Enjoyable</option>
      <option value="very-unenjoyable">Very Unenjoyable</option>
    </select>

    <label for="comments">
      Any additional comments or suggestions for improvement?
    </label>

    <input type="text" class="b" bind:value={postData.additionalComments} />

    <button type="submit" class="b p-xs">Submit</button>
  </form>
{:else}
  <button class="absolute bottom-0 m-xs b-b" popovertarget="instructions">
    {isOpen ? "Close" : "Instructions and contact info"}</button
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

  <section
    class="h-104mm w-62mm flex flex-col rounded-2xl b p-sm bg-brand-ipod"
  >
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
          <li>2. Turn volume to 100%.</li>
          <li>3. Feel vibrations.</li>
          <li>4. Guess the song.</li>
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
              gameState.state = "post_game_survey";
            }}
            class="button-style rounded-b-md">To post-game survey</button
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
{/if}

<style>
  .button-style {
    --uno: "hover:(bg-brand-hover text-white) focus:(bg-brand-hover text-white outline-0) w-full text-align-left px-1";
  }

  li:not(:has(button)) {
    --uno: "px-1";
  }
</style>
