// 필요한 변수들 선언
let score = 0;
let timeLeft = 30; // 30초 제한시간
let currentRecipe = null;
let selectedCards = [];
let isPlaying = false;
let timerInterval; // 타이머 인터벌 저장용 변수 추가

// recipes.json 불러오기
async function loadRecipes() {
  try {
    const response = await fetch("recipes.json");
    const recipes = await response.json();
    // console.log(recipes.recipes[1].name);
    return recipes.recipes;
  } catch (error) {
    console.error("레시피를 불러오는데 실패했습니다:", error);
    return [];
  }
}

// 랜덤 레시피 선택
function getRandomRecipe(recipes) {
  const randomIndex = Math.floor(Math.random() * recipes.length);
  return recipes[randomIndex];
}

// 게임 초기화
async function initGame() {
  const popup = document.getElementById("resultPopup");
  popup.classList.remove("show");
  selectedCards = [];

  loadRecipes().then((recipes) => {
    currentRecipe = getRandomRecipe(recipes);
    setupGameCards(currentRecipe);
    startTimer();
  });
}

// 배열을 랜덤하게 섞는 함수
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 카드 세팅
function setupGameCards(recipe) {
  const ingredientContainer = document.getElementById(
    "ingredient-card-container"
  );
  const quantityContainer = document.getElementById("quantity-card-container");
  const actionContainer = document.getElementById("action-card-container");

  // 컨테이너 초기화
  ingredientContainer.innerHTML = "";
  quantityContainer.innerHTML = "";
  actionContainer.innerHTML = "";

  // 레시피에서 각 타입별로 고유한 값만 추출
  let ingredients = [
    ...new Set(
      recipe.recipe
        .filter((item) => item.type === "ingredient")
        .map((item) => item.value)
    ),
  ];
  let quantities = [
    ...new Set(
      recipe.recipe
        .filter((item) => item.type === "quantity")
        .map((item) => item.value)
    ),
  ];
  let actions = [
    ...new Set(
      recipe.recipe
        .filter((item) => item.type === "action")
        .map((item) => item.value)
    ),
  ];

  // 각 배열을 랜덤하게 섞기
  ingredients = shuffleArray(ingredients);
  quantities = shuffleArray(quantities);
  actions = shuffleArray(actions);

  // 섞인 카드들을 컨테이너에 추가
  ingredients.forEach((ingredient) => {
    const card = createCard("ingredient", ingredient);
    ingredientContainer.appendChild(card);
  });

  quantities.forEach((quantity) => {
    const card = createCard("quantity", quantity);
    quantityContainer.appendChild(card);
  });

  actions.forEach((action) => {
    const card = createCard("action", action);
    actionContainer.appendChild(card);
  });

  // 레시피 이름 표시
  document.getElementById("recipe-name").textContent = recipe.name;

  // 다음 문제 버튼 숨기기
  document.getElementById("nextButton").style.display = "none";

  // 레시피 트랙 초기화
  document.getElementById("recipe-track").innerHTML = "";
  selectedCards = [];
}

// 카드 생성
function createCard(type, value) {
  const card = document.createElement("div");
  card.className = `${type}-card`;
  card.textContent = value;
  card.dataset.type = type;
  card.dataset.value = value;
  card.addEventListener("click", () => handleCardClick(card));
  return card;
}

// 카드 클릭 처리
function handleCardClick(card) {
  const recipeTrack = document.getElementById("recipe-track");
  const newCard = card.cloneNode(true);
  recipeTrack.appendChild(newCard);
  selectedCards.push({
    type: card.dataset.type,
    value: card.dataset.value,
  });

  // 선택된 카드 수가 현재 레시피의 스텝 수와 같아지면 정답 체크
  if (selectedCards.length === currentRecipe.recipe.length) {
    checkAnswer();
  }
}

// 점수 업데이트 함수 수정
function updateScore(newScore) {
  const scoreElement = document.getElementById("score-container");
  const oldScore = score;
  score = newScore;

  // 점수 증가 애니메이션
  if (newScore > oldScore) {
    scoreElement.style.transform = "scale(1.2)";
    scoreElement.style.color = "#4CAF50";
    setTimeout(() => {
      scoreElement.style.transform = "scale(1)";
      scoreElement.style.color = "";
    }, 500);
  }

  scoreElement.textContent = `Score: ${score}`;
}

// 팝업 표시 함수 수정
function showResultPopup(isCorrect) {
  const popup = document.getElementById("resultPopup");
  const resultText = popup.querySelector(".result-text");
  const scoreChange = popup.querySelector(".score-change");
  const nextButton = document.getElementById("nextButton");

  clearInterval(timerInterval); // 타이머 중지

  if (isCorrect) {
    resultText.textContent = "정답입니다!";
    resultText.className = "result-text correct";
    scoreChange.textContent = "+10점";

    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      initGame();
    }, 1500);
  } else {
    resultText.textContent = "틀렸습니다!";
    resultText.className = "result-text incorrect";
    scoreChange.textContent = "";

    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
    }, 1000);

    // 다음 문제 버튼 표시
    nextButton.style.display = "block";
  }
}

// 정답 체크 함수 수정
function checkAnswer() {
  const isCorrect = selectedCards.every(
    (card, index) =>
      card.type === currentRecipe.recipe[index].type &&
      card.value === currentRecipe.recipe[index].value
  );

  if (isCorrect) {
    updateScore(score + 10);
    showResultPopup(true);
  } else {
    showResultPopup(false);
    showCorrectAnswer();
  }
}

// 다음 버튼 이벤트 리스너 수정
document.getElementById("nextButton").addEventListener("click", () => {
  initGame();
});

// 정답 보여주기 함수 수정
function showCorrectAnswer() {
  const recipeTrack = document.getElementById("recipe-track");
  recipeTrack.innerHTML = "";

  // 정답 컨테이너 생성
  const answerContainer = document.createElement("div");
  answerContainer.className = "correct-answer-container";

  // 정답 문자열 생성
  let answerText = "정답: ";
  currentRecipe.recipe.forEach((step, index) => {
    if (step.type === "ingredient") {
      answerText += step.value;
    } else if (step.type === "quantity") {
      answerText += ` ${step.value}`;
    } else if (step.type === "action") {
      answerText += ` (${step.value})`;
    }

    // 마지막 항목이 아니면 쉼표 추가
    if (index < currentRecipe.recipe.length - 1) {
      answerText += " → ";
    }
  });

  answerContainer.textContent = answerText;
  recipeTrack.appendChild(answerContainer);
}

// 타이머 함수 수정
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timeLeft = 30;
  updateTimerLine();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerLine();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResultPopup(false);
      showCorrectAnswer();
      document.getElementById("nextButton").style.display = "block";
    }
  }, 1000);
}

// 타이머 라인 업데이트 함수 추가
function updateTimerLine() {
  const timerLine = document.querySelector(".timer-line");
  const percentage = (timeLeft / 30) * 100; // 30초 기준으로 계산
  timerLine.style.width = `${percentage}%`;
}

// 시작 화면 관련 코드 추가
document.getElementById('startButton').addEventListener('click', function() {
    document.getElementById('startScreen').classList.add('hidden');
    playBackgroundMusic();
    initGame();
});

// playBackgroundMusic 함수 수정
function playBackgroundMusic() {
    bgMusic.volume = 0.3;
    
    // 음악 컨트롤 버튼 추가
    const musicControl = document.createElement('button');
    musicControl.innerHTML = '🔊';
    musicControl.style.position = 'fixed';
    musicControl.style.top = '10px';
    musicControl.style.right = '10px';
    musicControl.style.zIndex = '1000';
    musicControl.style.padding = '5px 10px';
    musicControl.style.fontSize = '20px';
    musicControl.style.cursor = 'pointer';
    
    musicControl.addEventListener('click', function() {
        if (bgMusic.paused) {
            bgMusic.play();
            this.innerHTML = '🔊';
        } else {
            bgMusic.pause();
            this.innerHTML = '🔈';
        }
    });
    
    document.body.appendChild(musicControl);
    bgMusic.play();
}
