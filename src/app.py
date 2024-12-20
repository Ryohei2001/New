
from flask import Flask, render_template, request, jsonify
import os  # 環境変数を扱うために追加

app = Flask(__name__)

# 部員リスト
members = ["山田", "高木", "高橋", "能見", "栗原", "岡本", "原", "中山", "鰺坂", "乙部",
           "森中", "宮本", "森本", "多賀", "江田", "榎本", "大河内", "山田康", "塩尻", "小花",
           "川中", "三浦", "髙木航", "石川", "市坂", "山中", "瀬戸", "田邊", "中川"]

# 対外移動時の特定荷物とメンバーの割り当て制限
restricted_members = ["高橋", "能見", "森中", "榎本", "塩尻", "三浦", "市坂", "中川"]
restricted_items = ["ジャグ", "ゴール", "クーラー", "当たり練パッド"]


# 荷物と負担ポイント
item_weights = {
    "ジャグ": 5,
    "ボール": 2,
    "ゴール": 4,
    "クーラー": 5,
    "当たり練パッド": 5,
    "ボード袋": 3,
    "ストレッチポール": 3,
    "配信用バッテリー": 3,
    "テニスボール": 1,
    "三脚": 1,
    "BCAA": 1,
    "メジャー": 1,
    "タイム用脚立": 1,
    "折り畳みいす": 1,
    "試合球": 1,
    "ブルーシート": 1,
    "ハードル": 1,
    "体重計": 1,
    "チューブ": 1,
    "担架": 1,
    "ソフトボール": 1,
    "スコアボード": 1,
    "配信用カメラ": 1,
    "大三脚": 1,
    "メガホン": 1,
    "グッズ": 1,
    "プロジェクター": 1,
    "松葉杖": 1
}

burden_history = {member: 0 for member in members}
history_stack = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assign', methods=['POST'])
def assign():
    global burden_history, history_stack

    data = request.json
    items_input = data.get('items', [])
    injured_members = data.get('injured_members', [])
    destination = data.get('destination')  # 移動先を取得

    if not destination:
        return jsonify({"status": "error", "message": "移動先を選択してください"}), 400

    available_members = [member for member in members if member not in injured_members]

    if len(available_members) < len(items_input):
        return jsonify({"status": "error", "message": "荷物の数が利用可能なメンバーを超えています"}), 400

    history_stack.append(burden_history.copy())

    # ポイント倍率設定
    point_multiplier = 1 if destination == "ground_to_ground" else 2

    assignment = {}
    used_members = set()
    special_message = None  # 特別なメッセージ

    for item in items_input:
        candidates = [m for m in available_members if m not in used_members]

        if destination == "external":  # 対外移動の場合
            candidates = [
                m for m in candidates
                if not (m in restricted_members and item in restricted_items)
            ]

        if not candidates:
            used_members.clear()
            candidates = available_members
            if destination == "external":
                candidates = [
                    m for m in candidates
                    if not (m in restricted_members and item in restricted_items)
                ]

        sorted_members = sorted(candidates, key=lambda m: burden_history[m])
        assigned_member = sorted_members[0]

        if item not in assignment:
            assignment[item] = []
        assignment[item].append(assigned_member)

        # 負担ポイントの更新
        burden_history[assigned_member] += item_weights.get(item, 0) * point_multiplier
        used_members.add(assigned_member)

        # 高木にジャグまたはクーラーが割り当てられた場合
        if destination == "external" and assigned_member == "高木" and item in ["ジャグ", "クーラー"]:
            special_message = f"高木、重いけど頑張れ！（笑） ({item})"

    return jsonify({
        "status": "success",
        "assignment": assignment,
        "burden": burden_history,
        "special_message": special_message  # 特別メッセージを送信
    })

@app.route('/reset', methods=['POST'])
def reset():
    global burden_history, history_stack
    burden_history = {member: 0 for member in members}
    history_stack = []
    return jsonify({"status": "success", "message": "累計ポイントがリセットされました", "burden": burden_history})

@app.route('/undo', methods=['POST'])
def undo():
    global burden_history, history_stack
    if not history_stack:
        return jsonify({"status": "error", "message": "戻る履歴がありません"}), 400

    burden_history = history_stack.pop()
    return jsonify({"status": "success", "message": "1つ前の状態に戻りました", "burden": burden_history})

@app.route('/adjust-points', methods=['POST'])
def adjust_points():
    global burden_history
    adjustments = request.json

    for member, adjustment in adjustments.items():
        if member in burden_history:
            burden_history[member] += adjustment

    return jsonify({"status": "success", "message": "累計ポイントが更新されました", "burden": burden_history})

if __name__ == '__main__':
    # Render 用に $PORT 環境変数を利用
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)