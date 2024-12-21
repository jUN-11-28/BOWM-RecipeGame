import json

# Markdown 파일 생성 함수
def generate_markdown(data, output_file="README.md"):
    with open(output_file, "w", encoding="utf-8") as f:
        # How to Play 설명 작성
        f.write("# How to Play this Game!\n\n")
        f.write("1. 게임 시작 후 노래가 끝나기 전까지 플레이를 진행합니다 (약 1분 30초).\n")
        f.write("2. 한 레시피당 제한시간은 **30초**입니다.\n")
        f.write("3. 레시피를 맞출 때마다 **10점**이 부과됩니다.\n\n")
        f.write("**순서**: 재료 → 량 → 액션 순으로 진행됩니다.\n\n")
        f.write("량이 없는 것은 다음 카드를 바로 클릭하면 됩니다.\n\n")
        f.write("\n\n ver.1.0.0\n\n")
        f.write("---\n\n")

        # Recipes 섹션 생성
        f.write("# Recipes\n\n")

        for recipe in data["recipes"]:
            f.write(f"## {recipe['name']}\n\n")
            recipe_steps = []
            for step in recipe["recipe"]:
                color = ""
                if step["type"] == "ingredient":
                    color = "#ffae67"
                elif step["type"] == "quantity":
                    color = "#71c4ff"
                elif step["type"] == "action":
                    color = "#67ff76"
                
                recipe_steps.append(f'<span style="color:{color};">{step["value"]}</span>')

            # 화살표(→)로 연결된 단계 출력
            f.write(" → ".join(recipe_steps) + "\n\n")
            f.write("---\n\n")

# JSON 파일 읽기
def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# 메인 실행
if __name__ == "__main__":
    input_file = "recipes.json"  # 외부 JSON 파일 이름
    output_file = "README.md"  # 생성할 Markdown 파일 이름

    try:
        data = load_json(input_file)
        generate_markdown(data, output_file)
        print(f"Markdown file '{output_file}' has been generated.")
    except FileNotFoundError:
        print(f"Error: The file '{input_file}' was not found.")
    except json.JSONDecodeError:
        print(f"Error: The file '{input_file}' is not a valid JSON file.")