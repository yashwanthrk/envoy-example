import socket
from flask import Flask, jsonify


app = Flask(__name__)
health_status = True

@app.route('/api/2', methods=['GET'])
def hello_world():
    print(socket.gethostname())
    return 'Hey, we have Flask in a Docker container!'


@app.route('/health')
def health():
    if health_status:
        resp = jsonify(health="healthy")
        resp.status_code = 200
    else:
        resp = jsonify(health="unhealthy")
        resp.status_code = 500

    return resp

# @app.route("/calculate")
# def get_calculate(input: str):
#     """Some other endpoint doing a CPU intensive operation"""
#     return {"input": input, "result": _calculate(input)}


# def _calculate(input: str):
#     """Do important calculations for 500ms"""
#     start = timer()
#     m = hashlib.sha256()
#     m.update(input.encode('utf-8'))
#     output = m.hexdigest()
#     while start + 0.2 > timer():
#         m.update(output.encode('utf-8'))
#         output = m.hexdigest()
#     return output


"""Dummy Python API which behaves like a machine learning service.
Dependencies (install with pip):
 - fastapi
 - uvicorn
Run with:
    uvicorn api:app --workers 1 --port 4001
"""

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=4001)
