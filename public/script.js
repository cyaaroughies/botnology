document.getElementById("voice-button").addEventListener("click", () => {
  const text = "Hello! I am Professor Botonic, your premium AI tutor. Let's learn together!";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes("English"));
  speechSynthesis.speak(utterance);
});