from flask import Flask, render_template, request, send_file, send_from_directory, jsonify
from collections import defaultdict
from PyPDF2 import PdfReader
from spacy.matcher import Matcher

app = Flask(__name__, template_folder='')
app.static_folder = 'src'

def get_info(text, nlp):

    doc = nlp(text)
    info = defaultdict(set)

    for ent in doc.ents:
        info[ent.label_.split("|")[0]].add(ent.text)

    for k, v in info.items():
        info[k] = list(set(v)) 

    return info

def extract_email(text):
    emails = []
    matcher = Matcher(md_model.vocab)
    pattern = [{"LIKE_EMAIL": True}]
    matcher.add("EMAIL", [pattern])

    doc = md_model(text)
    matches = matcher(doc)
    
    for _, start, end in matches:
        span = doc[start:end]
        emails.append(str(span) )

    return emails

@ app.route('/', methods=['POST', 'GET'])
def main():
    if request.method == 'GET':
        return render_template('index.html')

@ app.route('/upload', methods=['POST', 'GET'])
def read_nii_files():
    if request.method == 'GET':
        return render_template('index.html')
    if request.method == 'POST':
        file = False
        try:
            file = request.files['upload']
        except:
            print('in1')
            text_input = request.form.get('message', '')
            print(text_input)
        print('in2')

        if file:
            text = ''
            reader = PdfReader(file)
            for p in range(len(reader.pages)):
                page = reader.pages[p]  # Assuming you want to read the first page
                text += page.extract_text()
        elif text_input:
            print('in')
            text = text_input
        else:
            return 'No file nor text provided'

        main_info = get_info(text, main_parser)

        phone_number = get_info(text, nlp=phone_number_extractor)['PHONE NUMBER']
        main_info['PHONE NUMBER'] = set(phone_number)

        email = extract_email(text)
        main_info['EMAIL'] = set(email)

        # json_info = {k: (list(w.capitalize() for w in v)) for k, v in main_info.items()}
        json_info = {k: list(v) for k, v in main_info.items()}
        json_info['FULL TEXT'] = text
        
        print(json_info)

        return jsonify(json_info)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

