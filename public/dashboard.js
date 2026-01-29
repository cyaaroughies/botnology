       <html lang="en">
        <button class="btn small" id="quizGrade">Grade</button>
      </div>
      <div class="grid2" style="margin-top:12px">
        <div class="card">
          <div class="field">
            <label>Topic</label>
            <input id="quizTopic" placeholder="e.g., Linear Algebra, Organic Chemistry"/>
          </div>
          <div class="field" style="margin-top:10px">
            <label>Level</label>
            <select id="quizLevel">
              <option value="associates">Associates</option>
              <option value="bachelors" selected>Bachelors</option>
              <option value="masters">Masters</option>
            </select>
          </div>
          <div class="row" id="quizAdvanced" style="margin-top:10px; gap:10px">
            <div class="field">
              <label>Question Count</label>
              <select id="quizCount">
                <option value="5" selected>5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div class="field">
              <label>Mode</label>
              <select id="quizMode">
                <option value="short" selected>Short Answer</option>
                <option value="mc">Multiple Choice</option>
              </select>
            </div>
          </div>
        </div>
        <div class="card">
          <table class="table" id="quizTable">
            <thead><tr><th style="width:55%">Question</th><th>Answer</th></tr></thead>
            <tbody id="quizList"></tbody>
          </table>
          <div class="smallmuted" id="quizScore" style="margin-top:8px">Score: 0 / 0</div>
          <div class="row" style="margin-top:10px">
            <button class="btn" id="quizSave">Save Set</button>
            <button class="btn" id="quizLoadLast">Load Last Set</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>

>>>>>>> b6fc6183b85d5f2b0664d1993105fef4760ba176<!DOCTYPE html> 