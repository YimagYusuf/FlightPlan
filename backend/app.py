from flask import Flask, request, jsonify
from Flightplan import FlightProject

# Load flight data once when the server starts
fp = FlightProject()
fp.readFile1("input.txt")  # or "input2.txt" if you want that file

app = Flask(__name__)

@app.route("/route", methods=["GET"])
def get_route():
    start = request.args.get("from")
    dest = request.args.get("to")
    pr = request.args.get("priority", "T")  # default to T if not given

    if not start or not dest:
        return jsonify({"error": "Missing required parameters"}), 400
    if start not in fp.cities or dest not in fp.cities:
        return jsonify({"error": "One or both cities not found"}), 404

    # We'll just reuse the explore method and printPaths logic here
    fp.visited = [False] * len(fp.cities)
    fp.explore(fp.cities.index(start), fp.cities.index(dest))

    results = [
        (fp.FinalPath[j], fp.fullCosts[j], fp.fullTimes[j])
        for j in range(len(fp.FinalPath))
    ]
    if pr == "T":
        results.sort(key=lambda x: x[2])
    elif pr == "C":
        results.sort(key=lambda x: x[1])

    if not results:
        return jsonify({"error": "No route found"}), 404

    best_path, best_cost, best_time = results[0]

    # clear buffers for next request
    fp.path.clear()
    fp.FinalPath.clear()
    fp.fullCosts.clear()
    fp.fullTimes.clear()

    return jsonify({
        "path": best_path,
        "totalCost": best_cost,
        "totalTime": best_time,
        "priority": pr
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)
