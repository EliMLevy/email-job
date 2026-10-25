// Mandatory training: a tic-tac-toe module. The player is X, the computer
// answers with O after every move. Win, lose, or draw all complete the open
// training task — closing the module mid-game leaves it open.
import { state } from "./state.js";
import { $, esc } from "./utils.js";
import { toast } from "./ui.js";
import { TRAINING_MESSAGE } from "./data.js";
import { openThread } from "./views.js";

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

/** "X" | "O" | "draw" | null (game still going). Pure — no DOM. */
export function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

/** The computer's move: a random empty cell, or -1 when the board is full. */
export function computerMove(board) {
  const open = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (!open.length) return -1;
  return open[Math.floor(Math.random() * open.length)];
}

let board = Array(9).fill(null);
let over = false;
let task = null; // the training task being played, if any

export function getBoard() {
  return [...board];
}

export function openTraining(t) {
  task = t;
  board = Array(9).fill(null);
  over = false;
  $("trainingStatus").textContent = "Your move — you're X.";
  $("trainingResult").textContent = "";
  renderBoard();
  $("trainingModal").classList.remove("hidden");
}

export function closeTraining() {
  $("trainingModal").classList.add("hidden");
  task = null;
  // Refresh the reading view behind the modal (task banner, Start button).
  if (state.openEmail) openThread(state.openEmail);
}

function renderBoard() {
  $("trainingGrid").innerHTML = board
    .map(
      (v, i) =>
        `<button class="ttt-cell" data-cell="${i}" ${v || over ? "disabled" : ""}>${v ? esc(v) : ""}</button>`
    )
    .join("");
}

/** Play X in cell i, then the computer answers. Returns the result, if any. */
export function playCell(i) {
  if (over || !task || board[i]) return checkWinner(board);
  board[i] = "X";
  let result = checkWinner(board);
  if (!result) {
    const j = computerMove(board);
    if (j >= 0) board[j] = "O";
    result = checkWinner(board);
  }
  if (result) {
    over = true;
    $("trainingStatus").textContent =
      result === "X"
        ? "You win! 🎉"
        : result === "O"
          ? "The computer wins this one."
          : "A draw — nobody wins, everybody learns.";
    $("trainingResult").textContent = "Training complete.";
    if (!task.done) {
      task.done = true;
      toast(TRAINING_MESSAGE, "good");
    }
  }
  renderBoard();
  return result;
}

/** Modal wiring: grid clicks, close, and the Start button in the read view. */
export function initTraining() {
  $("trainingGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cell]");
    if (btn) playCell(Number(btn.dataset.cell));
  });
  $("trainingClose").addEventListener("click", closeTraining);
  $("trainingBtn").addEventListener("click", () => {
    const email = state.openEmail;
    const t =
      email && state.tasks.find((x) => x.id === email.taskId && x.type === "training" && !x.done);
    if (t) openTraining(t);
  });
}
