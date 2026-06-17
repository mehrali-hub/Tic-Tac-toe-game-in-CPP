

let GameAPI = null; // will be populated with methods to call core logic

// Minimal JS fallback implementation of the same interface
class JSGameFallback {
  constructor(){ this.board = new Array(9).fill(0); this.cur=1; this.round=1; this.score1=0; this.score2=0; this.p1='Player 1'; this.p2='Player 2'; }
  set_names(a,b){ this.p1=a||'Player 1'; this.p2=b||'Player 2'; }
  new_match(){ this.board.fill(0); this.cur=1; this.round=1; this.score1=0; this.score2=0; }
  restart_round(){ this.board.fill(0); this.cur = (this.round%2===1)?1:2; }
  make_move(idx){ if (idx<0||idx>8||this.board[idx]!==0) return 0; this.board[idx]=this.cur; let w=this.checkWinner(); if (w!==0){ if (w===1) this.score1++; else this.score2++; this.round++; } else if (this.board.every(v=>v!==0)){ this.round++; } else this.cur= (this.cur===1?2:1); return 1; }
  get_cell(i){ return this.board[i]; }
  current_player(){ return this.cur; }
  suggest_move(){
    // copy of smart suggestion used in C++: win, block, minimax fallback
    for (let i=0;i<9;i++) if (this.board[i]===0){ let nb=this.board.slice(); nb[i]=this.cur; if (this._checkWinner(nb)===this.cur) return i; }
    let opp = this.cur===1?2:1;
    for (let i=0;i<9;i++) if (this.board[i]===0){ let nb=this.board.slice(); nb[i]=opp; if (this._checkWinner(nb)===opp) return i; }
    // simple preference: center, corners, sides
    const order=[4,0,2,6,8,1,3,5,7]; for (let i of order) if (this.board[i]===0) return i; return -1;
  }
  get_score(p){ return p===1?this.score1:this.score2; }
  get_round(){ return this.round; }
  checkWinner(){ return this._checkWinner(this.board); }
  _checkWinner(b){ const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for (let l of L){ if (b[l[0]]!==0 && b[l[0]]===b[l[1]] && b[l[1]]===b[l[2]]) return b[l[0]]; } return 0; }
}

function setupAPI() {
  if (typeof Module !== 'undefined' && Module.cwrap) {
    // Use WASM-exported C functions
    const create = Module.cwrap('create_game','number',[]);
    const destroy = Module.cwrap('destroy_game','void',['number']);
    const set_names = Module.cwrap('set_names','void',['number','string','string']);
    const make_move = Module.cwrap('make_move','number',['number','number']);
    const get_cell = Module.cwrap('get_cell','number',['number','number']);
    const current_player = Module.cwrap('current_player','number',['number']);
    const suggest_move = Module.cwrap('suggest_move','number',['number']);
    const restart_round = Module.cwrap('restart_round','void',['number']);
    const new_match = Module.cwrap('new_match','void',['number']);
    const get_score = Module.cwrap('get_score','number',['number','number']);
    const get_round = Module.cwrap('get_round','number',['number']);

    const instance = create();
    GameAPI = {
      set_names: (a,b)=>set_names(instance,a,b),
      new_match: ()=>new_match(instance),
      restart_round: ()=>restart_round(instance),
      make_move: (i)=>make_move(instance,i),
      get_cell: (i)=>get_cell(instance,i),
      current_player: ()=>current_player(instance),
      suggest_move: ()=>suggest_move(instance),
      get_score: (p)=>get_score(instance,p),
      get_round: ()=>get_round(instance),
    };
    console.log('Using WASM C++ core');
  } else {
    // Fallback to JS implementation
    const impl = new JSGameFallback();
    GameAPI = {
      set_names: (a,b)=>impl.set_names(a,b),
      new_match: ()=>impl.new_match(),
      restart_round: ()=>impl.restart_round(),
      make_move: (i)=>impl.make_move(i),
      get_cell: (i)=>impl.get_cell(i),
      current_player: ()=>impl.current_player(),
      suggest_move: ()=>impl.suggest_move(),
      get_score: (p)=>impl.get_score(p),
      get_round: ()=>impl.get_round(),
    };
    console.log('Using JS fallback core');
  }
}

// UI wiring
document.addEventListener('DOMContentLoaded',()=>{
  try {
    setupAPI();

    const startBtn = document.getElementById('startBtn');
  const login = document.getElementById('welcome');
  const game = document.getElementById('game');
  const boardEl = document.getElementById('board');
  const p1NameEl = document.getElementById('p1Name');
  const p2NameEl = document.getElementById('p2Name');
  const p1ScoreEl = document.getElementById('p1Score');
  const p2ScoreEl = document.getElementById('p2Score');
  const turnName = document.getElementById('turnName');
  const roundCounter = document.getElementById('roundCounter');
  const message = document.getElementById('message');

    // defensive fallback if setupAPI failed silently
    if (!GameAPI || typeof GameAPI.make_move !== 'function') {
      console.warn('GameAPI missing or invalid — using JS fallback explicitly');
      const impl = new JSGameFallback();
      GameAPI = {
        set_names: (a,b)=>impl.set_names(a,b),
        new_match: ()=>impl.new_match(),
        restart_round: ()=>impl.restart_round(),
        make_move: (i)=>impl.make_move(i),
        get_cell: (i)=>impl.get_cell(i),
        current_player: ()=>impl.current_player(),
        suggest_move: ()=>impl.suggest_move(),
        get_score: (p)=>impl.get_score(p),
        get_round: ()=>impl.get_round(),
      };
      showMessage('Using local JS core (no WASM) — ready');
    }

  function showMessage(txt, timeout=2200){ message.textContent=txt; message.classList.remove('hidden'); clearTimeout(message._t); message._t=setTimeout(()=>message.classList.add('hidden'), timeout); }

  function buildBoard(){ boardEl.innerHTML=''; for (let i=0;i<9;i++){ const cell=document.createElement('div'); cell.className='cell'; cell.dataset.idx=i; cell.addEventListener('click', onCellClick); boardEl.appendChild(cell);} }

  function syncUI(){
    for (let i=0;i<9;i++){ const cell = boardEl.children[i]; const v = GameAPI.get_cell(i); cell.classList.remove('x','o','filled'); cell.textContent=''; if (v===1){ cell.classList.add('x','filled'); cell.textContent='✕'; } else if (v===2){ cell.classList.add('o','filled'); cell.textContent='◯'; } }
    const cur = GameAPI.current_player(); turnName.textContent = (cur===1)?document.getElementById('player1Name').value||'Player 1':document.getElementById('player2Name').value||'Player 2';
    p1ScoreEl.textContent = GameAPI.get_score(1); p2ScoreEl.textContent = GameAPI.get_score(2);
    roundCounter.textContent = GameAPI.get_round();
  }

  function onCellClick(e){ const idx = Number(e.currentTarget.dataset.idx); if (GameAPI.make_move(idx)){ animatePlacement(e.currentTarget); setTimeout(()=>{
      syncUI(); checkOutcome();
    },120);} else showMessage('Invalid move'); }

  function animatePlacement(el){ el.animate([{transform:'scale(0.9)'},{transform:'scale(1.02)'},{transform:'scale(1)'}],{duration:200,easing:'ease'}); }

  function checkOutcome(){ // check for win/draw using simple logic similar to core
    const board = Array.from({length:9},(_,i)=>GameAPI.get_cell(i));
    const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let winner=0,line=null; for (let ln of L){ if (board[ln[0]]!==0 && board[ln[0]]===board[ln[1]] && board[ln[1]]===board[ln[2]]){ winner=board[ln[0]]; line=ln; break; }}
    if (winner!==0){ highlightWin(line); showMessage((winner===1?document.getElementById('player1Name').value:document.getElementById('player2Name').value)+' wins!'); setTimeout(()=>{ GameAPI.restart_round(); syncUI(); clearWin(); }, 1400); return; }
    if (board.every(v=>v!==0)){ showMessage('Draw'); setTimeout(()=>{ GameAPI.restart_round(); syncUI(); },1200); }
    syncUI();
  }

  function highlightWin(line){ // draw an animated SVG stroke across winning cells
    const svg = document.getElementById('winOverlay'); svg.innerHTML=''; const [a,b,c]=line; const size = boardEl.getBoundingClientRect(); const cell = boardEl.children[a].getBoundingClientRect(); const cellC = boardEl.children[c].getBoundingClientRect(); const x1 = cell.left - boardEl.getBoundingClientRect().left + cell.width/2; const y1 = cell.top - boardEl.getBoundingClientRect().top + cell.height/2; const x2 = cellC.left - boardEl.getBoundingClientRect().left + cellC.width/2; const y2 = cellC.top - boardEl.getBoundingClientRect().top + cellC.height/2; const lineEl = document.createElementNS('http://www.w3.org/2000/svg','line'); lineEl.setAttribute('x1',x1); lineEl.setAttribute('y1',y1); lineEl.setAttribute('x2',x2); lineEl.setAttribute('y2',y2); lineEl.setAttribute('stroke','rgba(255,255,255,0.14)'); lineEl.setAttribute('stroke-width','12'); lineEl.setAttribute('stroke-linecap','round'); svg.appendChild(lineEl);
    lineEl.animate([{strokeOpacity:0},{strokeOpacity:1},{strokeOpacity:0}],{duration:1200,fill:'forwards'});
  }
  function clearWin(){ document.getElementById('winOverlay').innerHTML=''; }

  // Controls
  document.getElementById('hintBtn').addEventListener('click',()=>{
    const idx = GameAPI.suggest_move(); if (idx>=0){ const cell = boardEl.children[idx]; cell.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:520}); cell.classList.add('hint'); setTimeout(()=>cell.classList.remove('hint'),620); showMessage('Suggested move highlighted'); } else showMessage('No suggestion');
  });

  document.getElementById('restartBtn').addEventListener('click',()=>{ GameAPI.restart_round(); syncUI(); showMessage('Round restarted'); clearWin(); });
  document.getElementById('newMatchBtn').addEventListener('click',()=>{ GameAPI.new_match(); syncUI(); showMessage('New match'); clearWin(); });

    startBtn.addEventListener('click', ()=>{
    const n1 = document.getElementById('player1Name').value.trim() || 'Player 1';
    const n2 = document.getElementById('player2Name').value.trim() || 'Player 2';
    GameAPI.set_names(n1,n2);
    p1NameEl.textContent = n1; p2NameEl.textContent = n2;
    login.classList.add('hidden'); game.classList.remove('hidden'); buildBoard(); syncUI(); showMessage('Welcome '+n1+' & '+n2+'!');
  });
  } catch (err) {
    console.error('Error initializing game UI:', err);
    const body = document.body;
    const errDiv = document.createElement('div');
    errDiv.style.position='fixed'; errDiv.style.left='12px'; errDiv.style.top='12px'; errDiv.style.padding='10px 12px'; errDiv.style.background='#831'; errDiv.style.color='#fff'; errDiv.style.borderRadius='8px';
    errDiv.textContent = 'Initialization error — open console for details';
    body.appendChild(errDiv);
  }
});
