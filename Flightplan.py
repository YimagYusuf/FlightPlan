class Route:
    def __init__(self, destination, cost, time):
        self.destination = destination
        self.cost = cost
        self.time = time

class FlightProject:
    def __init__(self):
        self.cities = []
        self.adjList = []
        self.request = []
        self.visited = None
        self.path = []
        self.FinalPath = []
        self.fullCosts = []
        self.fullTimes = []

    def readFile1(self, filename):
        with open(filename, 'r') as file:
            lines = file.readlines()
        numFlights = int(lines[0].strip())
        for i in range(1, numFlights + 1):
            elements = lines[i].strip().split('|')
            start = elements[0]
            destination = elements[1]
            cost = float(elements[2])
            time = int(elements[3])
            startIndex = self.getIndex(start)
            destinationIndex = self.getIndex(destination)
            max_index = max(startIndex, destinationIndex)
            while len(self.adjList) <= max_index:
                self.adjList.append([])
            self.adjList[startIndex].append(Route(destination, cost, time))
            self.adjList[destinationIndex].append(Route(start, cost, time))

    def getIndex(self, city):
        if city in self.cities:
            return self.cities.index(city)
        else:
            self.cities.append(city)
            return len(self.cities) - 1

    def explore(self, currentCityIndex, destinationIndex):
        self.visited[currentCityIndex] = True
        self.path.append(self.cities[currentCityIndex])
        if currentCityIndex == destinationIndex:
            self.savePath()
        else:
            self.serchAdj(currentCityIndex, destinationIndex)
        self.visited[currentCityIndex] = False
        self.path.pop()

    def savePath(self):
        currentPath = list(self.path)
        totalCost = self.calcCost()
        totalTime = self.calcTime()
        self.FinalPath.append(currentPath)
        self.fullCosts.append(totalCost)
        self.fullTimes.append(totalTime)

    def calcCost(self):
        totalCost = 0
        for i in range(len(self.path) - 1):
            currentCity = self.path[i]
            nextCity = self.path[i + 1]
            for flight in self.adjList[self.getIndex(currentCity)]:
                if flight.destination == nextCity:
                    totalCost += flight.cost
                    break
        return totalCost

    def calcTime(self):
        totalTime = 0
        for i in range(len(self.path) - 1):
            currentCity = self.path[i]
            nextCity = self.path[i + 1]
            for flight in self.adjList[self.getIndex(currentCity)]:
                if flight.destination == nextCity:
                    totalTime += flight.time
                    break
        return totalTime

    def serchAdj(self, currentCityIndex, destinationIndex):
        for flight in self.adjList[currentCityIndex]:
            nextCityIndex = self.getIndex(flight.destination)
            if not self.visited[nextCityIndex]:
                self.explore(nextCityIndex, destinationIndex)

    def promptAndFindPaths(self):
        flightNumber = 1
        while True:
            user_input = input("Enter request as from|to|Priority (or type 'exit' to quit): ").strip()
            if user_input.lower() == 'exit':
                break
            elements = user_input.split('|')
            if len(elements) < 2:
                print("Invalid input. Please enter in the format from|to|Priority.")
                continue
            startCity = elements[0]
            destinationCity = elements[1]
            priority = elements[2] if len(elements) > 2 else "N/A"
            if startCity not in self.cities or destinationCity not in self.cities:
                print("One or both cities not found in the flight data.")
                continue
            startIndex = self.cities.index(startCity)
            destinationIndex = self.cities.index(destinationCity)
            self.visited = [False] * len(self.cities)
            self.explore(startIndex, destinationIndex)
            print(f"Flight {flightNumber}: {startCity}, {destinationCity} | Priority: {priority}")
            self.printPaths(priority)
            flightNumber += 1

    def printPaths(self, priority="N/A"):
        pathNumber = 1
        # Prepare a list of tuples: (path, totalcost, totaltime)
        results = [
            (self.FinalPath[j], self.fullCosts[j], self.fullTimes[j])
            for j in range(len(self.FinalPath))
        ]
        # Sort based on priority
        if priority == "T":
            results.sort(key=lambda x: x[2])  # Sort by time
        elif priority == "C":
            results.sort(key=lambda x: x[1])  # Sort by cost

        for path, totalcost, totaltime in results:
            print(f"Path {pathNumber}: ", end="")
            print(" -> ".join(path), end="")
            print(f". Time: {totaltime} Cost: {totalcost}")
            pathNumber += 1
        self.path.clear()
        self.FinalPath.clear()
        self.fullCosts.clear()
        self.fullTimes.clear()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python flightplan.py <flights_file>")
        sys.exit(1)
    flightProject = FlightProject()
    flightProject.readFile1(sys.argv[1])
    flightProject.promptAndFindPaths()