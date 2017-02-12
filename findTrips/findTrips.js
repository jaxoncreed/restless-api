import {cloneDeep} from 'lodash'


const doesNotOverlap = (values) => {
  let mockItinerary = [];
  for (let i = 0; i < values.length; i ++) {
    let duration = values[i].duration;
    for (let j = duration; j > 0; j--) {
      if (mockItinerary[j]) {
        return false;
      }
      mockItinerary[j] = 1;
    }
  }
  return true;
}

export default function(body, req, res) {
  var csp = {
    variableDomains: {},
    constraints: [],
    scores: {}
  }

  let startTime = body.startTime;
  let endTime = body.endTime;


  let attractions = body.attractions;
  let hotels = body.hotels;
  let allVars = attractions.concat(hotels).map(item => item.id);
  // build variables

  attractions.forEach((attraction) => {
    csp.variableDomains[attraction.id] = [];
    for (let i = startTime; i <= endTime - attraction.duration; i++) {
      csp.variableDomains[attraction.id].push({
        duration: attraction.duration,
        cost: attraction.cost,
        startTime: i
      })
    }
  });
  // build constraints
  csp.constraints.push({
    vars: new Set(allVars),
    func: doesNotOverlap
  });
  // build scores
  var solved = solve(csp);
  console.log(solved);
  res.send(solved);
}

/* csp
{
  variableDomains: {
    "varName": Set([{duration: , startTime: }, 'startTime'])
  },
  constraints: [
    {
      vars: ['name', 'name', 'name'],
      func:
    }
  ]
}
*/


class Assignment {
  constructor(csp) {
    this.variableDomains = cloneDeep(csp.variableDomains);
    this.assignedValues = {};
  }
  isAssigned(variable) {
    return !!this.assignedValues[variable];
  }
  isComplete() {
    let keys = Object.keys(this.variableDomains);
    for (let i = 0; i < keys.length; i++) {
      if (!this.isAssigned(keys[i])) {
        return false;
      }
    }
    return true;
  }
  extractSolution() {
    if (this.isComplete()) {
      return self.assignedValues
    }
  }
}

function solve(csp) {
  let assignment = new Assignment(csp);
  //assignment = eliminateUnaryConstraints(assignment, csp);
  assignment = recursiveBacktrackingWithInferences(assignment, csp)
  return assignment;
}

function consistent(assignment, csp, variable, value) {
	if (!csp.variableDomains[variable]) {
    return false
  }
  let newAssigned = cloneDeep(assignment.assignedValues);
  newAssigned[variable] = value;
  for (let i = 0; i < csp.constraints.length; i++) {
    let paramArr = Array.from(csp.constraints[i].vars).map(constraintVar => newAssigned[constraintVar]).filter(item => !!item);
    if (!csp.constraints[i].func(paramArr)) {
      return false;
    }
  }
  return true;
}

function minimumRemainingValuesHeuristic(assignment, csp) {
  let nextVar = null;
	let domains = assignment.variableDomains;
	let minNumber = null
	let minVars = null
	Object.keys(domains).forEach((key) => {
    let numberInDomain = domains[key]
		if ((!minNumber || !numberInDomain < minNumber) && !assignment.assignedValues[key]) {
      minNumber = numberInDomain
			minVars = [key]
    } else if (minNumber === numberInDomain && assignment.assignedValues[key]) {
      minVars.push(key)
    }
  })
  // TODO: There should be a tie breaker here, but I'm lazy
	return minVars[0];
}

function constrainedValues(assignment, csp, variable, value) {
	let constrained = 0
  let newAssigned = cloneDeep(assignment.assignedValues);
  newAssigned[variable] = value;
	csp.constraints.forEach((constraint) => {
    if (constraint.vars.has(variable)) {
      let paramArr = Array.from(constraint.vars).map(constraintVar => newAssigned[constraintVar]).filter(item => !!item);
      if (!constraint.func(paramArr)) {
        constrained++;
      }
    }
  });
	return constrained
}

function leastConstrainingValuesHeuristic(assignment, csp, variable) {
  let values = assignment.variableDomains[variable]
	let valArr = []
	values.forEach((value) => {
    valArr.push({value: value , numConstrained: constrainedValues(assignment, csp, variable, value)})
  });
  console.log(valArr.sort((a, b) => a.numConstrained - b.numConstrained));
	return valArr.sort((a, b) => a.numConstrained - b.numConstrained).map(item => item.value);
}

function forwardChecking(assignment, csp, variable, value) {
  let inferences = new Set([])
  // this is a hack because I'm too lazy to get rid of the foreach
  let works = true;
	let domains = assignment.variableDomains
	let tempAssignedValues = assignment.assignedValues[variable]
	assignment.assignedValues[variable] = value
	Object.keys(assignment.assignedValues).forEach((varKey) => {
    if (!assignment.assignedValues[varKey]) {
      let elimVals = []
			domains[varKey].forEach((hypeVal) => {
        if (!consistent(assignment, csp, varKey, hypeVal)) {
					elimVals.push(hypeVal)
        }
      });
			elimVals.forEach((elimVal) => {
        inferences.add([varKey, elimVal])
				assignment.varDomains[varKey].remove(elimVal)
				if (assignment.varDomains[varKey].length === 0) {
					inferences.forEach((infrerence) => {
            assignment.varDomains[inference[0]].add(inference[1])
          });
          works = false
        }
      });
    }
  });
	if (!works) {
    return null;
  }
	assignment.assignedValues[variable] = tempAssignedValues
	return inferences
}

function recursiveBacktrackingWithInferences(assignment, csp) {
  let variable = minimumRemainingValuesHeuristic(assignment, csp);
	let orderValues = leastConstrainingValuesHeuristic(assignment, csp, variable)
	orderValues.forEach((value) => {
    if (consistent(assignment, csp, variable, value)) {
			assignment.assignedValues[variable] = value;
			if (assignment.isComplete()) {
				return assignment
      }
			let inferences = forwardChecking(assignment, csp, variable, value)
			if (inferences) {
				let newAssignment = recursiveBacktrackingWithInferences(assignment, csp)
				if (newAssignment) {
					return newAssignment
        }
				inferences.forEach((inference) => {
          assignment.varDomains[inference[0]].add(inference[1])
        })
      }
			delete assignment.assignedValues[variable]
    }
  })
  return null
}
