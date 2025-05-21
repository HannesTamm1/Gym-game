<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// State and Assets
const cookies = ref(0);
const currentCookieImage = ref('https://cdn.pixabay.com/photo/2018/03/20/22/07/silhouette-3244888_960_720.png'); // Replace with real pushup image URL
const selectedWorkout = ref('');

// Workout images
const workoutImages = {
  'Pushups': 'https://cdn.pixabay.com/photo/2018/03/20/22/07/silhouette-3244888_960_720.png',
  'Bicep Curls': 'https://png.pngtree.com/png-vector/20241109/ourmid/pngtree-muscular-man-performing-bicep-curls-with-dumbbells-for-arm-strength-png-image_14337311.png',
  'Bench press': 'https://www.shutterstock.com/image-vector/weight-lifting-muscle-man-bodybuilder-600nw-2294612599.jpg',
  'Squats': 'https://rlv.zcache.com/squat_silhouette_poster-r12fd89b08c274a12b5737f84f0a45952_wqa_8byvr_644.webp',
  'Deadlifts': 'https://static.vecteezy.com/system/resources/thumbnails/053/968/531/small/man-doing-deadlift-vector.jpg',
  'Running': 'https://media.istockphoto.com/id/923757234/vector/black-runner.jpg?s=612x612&w=0&k=20&c=nkd8EQZythJYPlFH6tYsZzeL-xLdxRBRZitzwXjUDzA=',
};

// Buildings
const buildings = ref([
  { name: 'Creatine', price: 15, count: 0, cps: 0.1 },
  { name: 'Energy Drinks', price: 100, count: 0, cps: 1 },
  { name: 'Steroids', price: 1000, count: 0, cps: 10 },
  { name: 'Gym god genetics', price: 10000, count: 0, cps: 100 },
]);

// CPS calculation
const cps = computed(() => {
  return buildings.value.reduce((sum, b) => sum + b.cps * b.count, 0);
});

// Upgrades
const upgrades = ref([
  { name: 'Become a Personal trainer', price: 50000, bought: false },
  { name: 'Gym owner', price: 100000, bought: false }
]);

// Achievements conditions
const achievementConditions = {
  'Reach power level 1': () => cps.value >= 1,
  'Reach power level 5': () => cps.value >= 5,
  'Reach power level 10': () => cps.value >= 10,
  'Became a Personal Trainer': () => upgrades.value.find(u => u.name === 'Become a Personal trainer')?.bought,
  'Opened Your Own Gym': () => upgrades.value.find(u => u.name === 'Gym owner')?.bought,
};

// Achievements tracking
const achievementGoals = ref([
  { name: 'Reached power level 1', condition: achievementConditions['Reach power level 1'], achieved: false },
  { name: 'Reached power level 5', condition: achievementConditions['Reach power level 5'], achieved: false },
  { name: 'Reached power level 10', condition: achievementConditions['Reach power level 10'], achieved: false },
  { name: 'Became a Personal Trainer', condition: achievementConditions['Became a Personal Trainer'], achieved: false },
  { name: 'Opened Your Own Gym', condition: achievementConditions['Opened Your Own Gym'], achieved: false },
]);

// CPS tick
const cpsInterval = setInterval(() => {
  cookies.value += cps.value;
  document.title = `${cookies.value.toFixed(1)} Power`;
  saveGame();
}, 1000);

// Buy building
function buyBuilding(building) {
  if (cookies.value >= building.price) {
    cookies.value -= building.price;
    building.price += Math.ceil(building.price * 0.15);
    building.count++;
  }
}

// Buy upgrade
function buyUpgrade(upgrade) {
  if (cookies.value >= upgrade.price && !upgrade.bought) {
    cookies.value -= upgrade.price;
    upgrade.bought = true;
    checkAchievements();
  }
}

// Achievement checker
function checkAchievements() {
  achievementGoals.value.forEach(ach => {
    if (!ach.achieved && ach.condition()) {
      ach.achieved = true;
    }
  });
}

watch(cps, checkAchievements);

// Save game
function saveGame() {
  localStorage.setItem('cookieData', JSON.stringify({
    cookies: cookies.value,
    buildings: buildings.value,
    upgrades: upgrades.value,
    achievements: achievementGoals.value.map(({ name, achieved }) => ({ name, achieved })),
    image: currentCookieImage.value,
  }));
}

// Load game
function loadGame() {
  const saved = JSON.parse(localStorage.getItem('cookieData'));
  if (saved) {
    cookies.value = saved.cookies;
    buildings.value = saved.buildings;
    upgrades.value = saved.upgrades;
    currentCookieImage.value = saved.image;

    // Match the selected workout from saved image
    selectedWorkout.value = Object.keys(workoutImages).find(
      key => workoutImages[key] === saved.image
    ) || '';

    achievementGoals.value = saved.achievements.map(ach => ({
      name: ach.name,
      achieved: ach.achieved,
      condition: achievementConditions[ach.name] || (() => false)
    }));
  }
}

// Reset game
function resetGame() {
  localStorage.removeItem('cookieData');
  location.reload();
}

// Change workout image
function changeWorkout() {
  if (selectedWorkout.value && workoutImages[selectedWorkout.value]) {
    currentCookieImage.value = workoutImages[selectedWorkout.value];
    saveGame();
  }
}

onMounted(() => {
  loadGame();
});

onUnmounted(() => {
  clearInterval(cpsInterval);
});
</script>

<template>
  <div class="container mt-6">
    <div class="columns is-variable is-3">
      <!-- Stats and Image -->
      <div class="column is-3 has-background-light has-text-centered p-4">
        <h1 class="title is-3">Power: {{ cookies.toFixed(1) }}</h1>
        <h2 class="subtitle is-5">Power level: {{ cps.toFixed(1) }}</h2>

        <!-- Workout Image -->
        <figure class="image is-128x128 mx-auto my-4" style="cursor:pointer">
          <img @click="cookies++" :src="currentCookieImage" alt="Workout" class="is-rounded" />
        </figure>

        <!-- Reset Button -->
        <button class="button is-danger is-small mt-3" @click="resetGame">Reset Game</button>

        <!-- Dropdown Workout Selector -->
        <div class="select mt-3">
          <select v-model="selectedWorkout" @change="changeWorkout">
            <option disabled value="">Choose Workout</option>
            <option v-for="(url, workout) in workoutImages" :key="workout" :value="workout">
              {{ workout }}
            </option>
          </select>
        </div>
      </div>

      <!-- Achievements and Upgrades -->
      <div class="column is-6 has-background-white p-4">
        <h3 class="title is-4 mb-2">Achievements</h3>
        <ul>
          <li v-for="ach in achievementGoals" :key="ach.name">
            <span :class="ach.achieved ? 'has-text-success' : 'has-text-grey'">
              {{ ach.achieved ? '✔️' : '◻️' }} {{ ach.name }}
            </span>
          </li>
        </ul>

        <hr class="my-4">

        <h3 class="title is-4 mb-2">Your purpose</h3>
        <div v-for="upgrade in upgrades" :key="upgrade.name" class="mb-2">
          <button
            class="button is-link is-fullwidth"
            :disabled="cookies < upgrade.price || upgrade.bought"
            @click="buyUpgrade(upgrade)">
            {{ upgrade.name }} - {{ upgrade.price }} Power
            <span v-if="upgrade.bought"> (Bought)</span>
          </button>
        </div>
      </div>

      <!-- Shop -->
      <div class="column is-3 has-background-light p-4">
        <h3 class="title is-4">Shop</h3>
        <div v-for="building in buildings" :key="building.name" class="mb-2">
          <button
            class="button is-primary is-fullwidth"
            :disabled="cookies < building.price"
            @click="buyBuilding(building)">
            {{ building.name }} - {{ building.price }} Power (x{{ building.count }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
</style>
