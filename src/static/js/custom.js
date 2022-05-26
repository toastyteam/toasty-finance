let initialMode = localStorage.getItem("dark");
let darkSwitcher = document.getElementById("dark");
let lightSwitcher = document.getElementById("light");
if (initialMode) {
  switch (initialMode) {
    case "on":
      modeSwitcher("on");
      break;
    default:
      modeSwitcher("off");
      break;
  }
}
darkSwitcher.addEventListener("click", () => {
  modeSwitcher("on");
});

lightSwitcher.addEventListener("click", () => {
  modeSwitcher("off");
});

function modeSwitcher(dark) {
  darkSwitcher.classList.remove("active");
  lightSwitcher.classList.remove("active");
  if (dark === "on") {
    darkSwitcher.classList.add("active");
    document.getElementsByTagName("body")[0].classList.add("dark");
    localStorage.setItem("dark", "on");
  } else {
    lightSwitcher.classList.add("active");
    document.getElementsByTagName("body")[0].classList.remove("dark");
    localStorage.setItem("dark", "off");
  }
}

// LP countdown
var countDownDate = new Date(Date.UTC(2022, 4, 26, 14, 0, 0)).getTime()
function calcTime() {
  var now = new Date().getTime()
  // Find the distance between now and the count down date
  var distance = countDownDate - now
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24))
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.floor((distance % (1000 * 60)) / 1000)

  document.getElementById("days").innerHTML = days
  document.getElementById("hours").innerHTML = hours - 1
  document.getElementById("minutes").innerHTML = minutes
  document.getElementById("seconds").innerHTML = seconds

  if (distance < 0) {
    document.getElementById("days").innerHTML = 0
    document.getElementById("hours").innerHTML = 0
    document.getElementById("minutes").innerHTML = 0
    document.getElementById("seconds").innerHTML = 0
  }
}

// Main
calcTime()

setInterval(function() {
  calcTime()
}, 1000);
