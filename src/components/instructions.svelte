<script lang="ts">
  let testPlayer = $state() as HTMLAudioElement;
  let isPlaying = $state(false);
</script>

<section class="text-justify max-w-prose flex flex-col gap-lg font-form">
  <h3><b>How to play</b></h3>
  <p>
    Your task is to identify songs by feeling vibration patterns through your
    fingertips using the Basslet actuator. You'll feel the vibrations and choose
    the correct song from three options.
  </p>

  <h4><b>Setup:</b></h4>
  <ol class="ml-5 list-decimal">
    <li>Connect the Basslet actuator to your computer.</li>
    <li>Set your computer audio volume to maximum.</li>
    <li>Press "New Game" to begin.</li>
  </ol>

  <h4><b>Test your actuator</b></h4>

  <audio
    src="/test-file.wav"
    bind:this={testPlayer}
    ontimeupdate={() => {
      if (testPlayer.ended) {
        isPlaying = false;
      } else {
        isPlaying = true;
      }
    }}
  ></audio>
  <button
    class="b"
    onclick={() => {
      !isPlaying ? testPlayer.play() : testPlayer.pause();
    }}>{isPlaying ? "testing..." : "click to test"}</button
  >

  <p>If there are any issues, please contact marika.bergman@tuni.fi</p>

  <h4><b>During the Game:</b></h4>
  <ul class="flex flex-col gap-2">
    <li>
      Click the play button to feel the vibration pattern through your fingers
    </li>
    <li>
      You can pause and replay, but the pattern will restart from the beginning
    </li>
    <li>Select the song you think matches the pattern</li>
    <li><b>Once you click your answer, you cannot change it</b></li>
    <li>
      You'll immediately see if your guess was correct (1 point for correct, 0
      for incorrect)
    </li>
  </ul>

  <h4><b>Game Details:</b></h4>
  <p>
    The game consists of 6 rounds using songs from the pre-study survey.
    Afterward, you'll see your total score and complete a short post-study
    survey.
  </p>
</section>
