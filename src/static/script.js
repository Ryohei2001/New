

// ページ読み込み時にけが人チェックボックスを生成
document.addEventListener("DOMContentLoaded", () => {
    const injuredList = document.getElementById("injuredList");
    members.forEach(member => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = member;
    checkbox.value = member;
    
    const label = document.createElement("label");
    label.htmlFor = member;
    label.textContent = member;
    
    injuredList.appendChild(checkbox);
    injuredList.appendChild(label);
    injuredList.appendChild(document.createElement("br"));
    });
    });
    
    // 割り当て処理
    document.getElementById("submitBtn").addEventListener("click", async () => {
        const destination = document.getElementById("destination").value;
        if (!destination) {
            alert("移動先を選択してください！");
            return;
        }
    
        const items = [
            ...Array(parseInt(document.getElementById("jug").value) || 0).fill("ジャグ"),
            ...Array(parseInt(document.getElementById("ball").value) || 0).fill("ボール"),
            ...Array(parseInt(document.getElementById("goal").value) || 0).fill("ゴール"),
            ...Array(parseInt(document.getElementById("cooler").value) || 0).fill("クーラー"),
            ...Array(parseInt(document.getElementById("cage").value) || 0).fill("かご"),
            ...Array(parseInt(document.getElementById("board").value) || 0).fill("ボード袋"),
            ...Array(parseInt(document.getElementById("practicePad").value) || 0).fill("当たり練パッド"),
            ...Array(parseInt(document.getElementById("stretchPole").value) || 0).fill("ストレッチポール"),
            ...Array(parseInt(document.getElementById("battery").value) || 0).fill("配信用バッテリー"),
            ...Array(parseInt(document.getElementById("tennisBall").value) || 0).fill("テニスボール"),
            ...Array(parseInt(document.getElementById("tripod").value) || 0).fill("三脚"),
            ...Array(parseInt(document.getElementById("bcaa").value) || 0).fill("BCAA"),
            ...Array(parseInt(document.getElementById("measure").value) || 0).fill("メジャー"),
            ...Array(parseInt(document.getElementById("timeLadder").value) || 0).fill("タイム用脚立"),
            ...Array(parseInt(document.getElementById("foldingChair").value) || 0).fill("折り畳みいす"),
            ...Array(parseInt(document.getElementById("matchBall").value) || 0).fill("試合球"),
            ...Array(parseInt(document.getElementById("blueSheet").value) || 0).fill("ブルーシート"),
            ...Array(parseInt(document.getElementById("hurdle").value) || 0).fill("ハードル"),
            ...Array(parseInt(document.getElementById("scale").value) || 0).fill("体重計"),
            ...Array(parseInt(document.getElementById("tube").value) || 0).fill("チューブ"),
            ...Array(parseInt(document.getElementById("stretcher").value) || 0).fill("担架"),
            ...Array(parseInt(document.getElementById("softBall").value) || 0).fill("ソフトボール"),
            ...Array(parseInt(document.getElementById("scoreboard").value) || 0).fill("スコアボード"),
            ...Array(parseInt(document.getElementById("camera").value) || 0).fill("配信用カメラ"),
            ...Array(parseInt(document.getElementById("largeTripod").value) || 0).fill("大三脚"),
            ...Array(parseInt(document.getElementById("megaphone").value) || 0).fill("メガホン"),
            ...Array(parseInt(document.getElementById("goods").value) || 0).fill("グッズ"),
            ...Array(parseInt(document.getElementById("projector").value) || 0).fill("プロジェクター"),
            ...Array(parseInt(document.getElementById("crutch").value) || 0).fill("松葉杖")
        ];
        const injured_members = Array.from(document.querySelectorAll("#injuredList input:checked")).map(checkbox => checkbox.value);
    
        const payload = { items, injured_members, destination };
    
        try {
            const response = await fetch("/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.status === "success") {
                document.getElementById("result").textContent = "割り当てが完了しました。\n";
                displayAssignment(result.assignment);
                displayBurden(result.burden);
            } else {
                document.getElementById("result").textContent = `エラー: ${result.message}`;
            }
        } catch (error) {
            document.getElementById("result").textContent = `エラー: ${error.message}`;
        }
    });
    
    
    // リセット処理
    document.getElementById("resetBtn").addEventListener("click", async () => {
    try {
    const response = await fetch("/reset", { method: "POST" });
    const result = await response.json();
    if (result.status === "success") {
    document.getElementById("result").textContent = "累計ポイントがリセットされました。\n";
    displayBurden(result.burden);
    } else {
    document.getElementById("result").textContent = `エラー: ${result.message}`;
    }
    } catch (error) {
    document.getElementById("result").textContent = `エラー: ${error.message}`;
    }
    });
    
    // 戻る処理
    document.getElementById("undoBtn").addEventListener("click", async () => {
    try {
    const response = await fetch("/undo", { method: "POST" });
    const result = await response.json();
    if (result.status === "success") {
    document.getElementById("result").textContent = "1つ前の状態に戻りました。\n";
    displayBurden(result.burden);
    } else {
    document.getElementById("result").textContent = `エラー: ${result.message}`;
    }
    } catch (error) {
    document.getElementById("result").textContent = `エラー: ${error.message}`;
    }
    });
    
    // ポイント調整処理
    document.getElementById("executeAdjustPointsBtn").addEventListener("click", async () => {
    const selectedMember = document.getElementById("adjustPointsMember").value;
    const adjustmentValue = parseInt(document.getElementById("adjustPointsValue").value) || 0;
    
    if (!selectedMember || adjustmentValue === 0) {
    alert("メンバーとポイントを正しく入力してください。");
    return;
    }
    
    const adjustments = { [selectedMember]: adjustmentValue };
    
    try {
    const response = await fetch("/adjust-points", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adjustments),
    });
    
    const result = await response.json();
    if (result.status === "success") {
    document.getElementById("result").textContent = "累計ポイントが更新されました。\n";
    displayBurden(result.burden);
    } else {
    document.getElementById("result").textContent = `エラー: ${result.message}`;
    }
    } catch (error) {
    document.getElementById("result").textContent = `エラー: ${error.message}`;
    }
    });
    
    // 割り当て結果を表示
    function displayAssignment(assignment) {
    let resultText = "割り当て結果:\n";
    for (const [item, members] of Object.entries(assignment)) {
    resultText += `${item}: ${members.join(", ")}\n`;
    }
    document.getElementById("result").textContent += resultText;
    }
    
    // 累計ポイントを表示
    function displayBurden(burden) {
    let sortedBurden = Object.entries(burden)
    .sort(([, a], [, b]) => b - a); // ポイントが多い順にソート
    
    let resultText = "\n累計ポイント:\n";
    for (const [member, points] of sortedBurden) {
    resultText += `${member}: ${points}\n`;
    }
    document.getElementById("result").textContent += resultText;
    }