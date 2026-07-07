


async function test0(){
	let [text,di] = await loadFunctionsFromFiles(['../coding/test.js']);
	console.log(di);
	
}
function matchAndExtract(text, pattern) {
  const match = pattern.exec(text);

  if (match) {
    // Extract the matched groups and the remaining text after the match
    const [fullMatch, ...groups] = match; // full match and captured groups
    const remainingText = text.slice(match.index + fullMatch.length).trim(); // Get text after the match

    // Return the match details
    return { match: fullMatch, groups, remainingText };
  }

  // If no match, return null or appropriate value
  return null;
}
function extractFunctions(fileContent, di) {

  // Regex pattern to match function details after split
  const functionPattern = /^\s*(async\s*)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)\}/;

  // Iterate over each split section to extract function names, parameters, and bodies
  const functionSections = fileContent.split(/\bfunction\b|\basync function\b/);

  functionSections.forEach(section => {
    section = section.trim();

    if (section) {
      console.log('section', section)
      // Try to match the function using the regex
      const match = functionPattern.exec(section);

      if (match) {
        const [_, asyncKeyword, name, params, body] = match;

        if (name && body) {
          // Reconstruct the function with async if necessary
          const functionSignature = asyncKeyword ? `async function ${name}(${params}) {` : `function ${name}(${params}) {`;
          di[name] = `${functionSignature}${body}}`;
        }
      }
    }
  });

}
async function loadFunctionsFromFiles(filenames) {

  const functionsDict = {};
  // Load and process each file
  for (const filename of filenames) {
    try {
      const response = await fetch(filename);
      const fileContent = await response.text();
      extractFunctions(fileContent, functionsDict);
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    }
  }

  const sortedFunctionNames = Object.keys(functionsDict).sort();
  const result = sortedFunctionNames.map(name => functionsDict[name]).join('\n');

  return [result, functionsDict];


}

async function _loadFunctionsFromFiles(filenames) {
  const functionsDict = {};

  // Helper function to extract function names, parameters, and bodies using regex after splitting
  function extractFunctions(fileContent) {
    const functions = {};

    // Split the content by 'async function' and 'function' (we include async to handle both types)
    const functionSections = fileContent.split(/\bfunction\b|\basync function\b/);

    // Regex pattern to match function details after split
    const functionPattern = /^\s*(async\s*)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)\}/;

    // Iterate over each split section to extract function names, parameters, and bodies
    functionSections.forEach(section => {
      section = section.trim();

      if (section) {
        console.log('section', section)
        // Try to match the function using the regex
        const match = functionPattern.exec(section);

        if (match) {
          const [_, asyncKeyword, name, params, body] = match;

          if (name && body) {
            // Reconstruct the function with async if necessary
            const functionSignature = asyncKeyword ? `async function ${name}(${params}) {` : `function ${name}(${params}) {`;
            functions[name] = `${functionSignature}${body}}`;
          }
        }
      }
    });

    return functions;
  }

  // Load and process each file
  for (const filename of filenames) {
    try {
      const response = await fetch(filename);
      const fileContent = await response.text();
      const extractedFunctions = extractFunctions(fileContent);

      // Overwrite functions in the dict with the latest ones from the current file
      for (const [name, func] of Object.entries(extractedFunctions)) {
        functionsDict[name] = func;
      }
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    }
  }

  // Sort function names alphabetically and join them into a string
  const sortedFunctionNames = Object.keys(functionsDict).sort();
  const result = sortedFunctionNames
    .map(name => functionsDict[name])
    .join('\n\n');  // Separate functions with an empty line

  return result;
}
async function _loadFunctionsFromFiles(filenames) {
  const functionsDict = {};

  // Helper function to extract function names and their bodies from a file's content
  function extractFunctions(fileContent) {
    // Updated regex to handle default parameters and async functions

    //const functionPattern = /async?\s*function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    //const functionPattern = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    //const functionPattern = /async?\s*function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    const functionPattern = /^\s*(async\s*)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)\}/;

    let match;
    const functions = {};

    let x = matchAndExtract(fileContent, functionPattern);
    while (x) {
      console.log('_____x', x);
      let rest = x.remainingText;
      console.log('rest', rest);
      let match = x.match;
      //console.log('___MATCH!\n','_',_,'\nname',name,'\nparams',params,'\nbody',body)
      // let s = _.startsWith('async')?'async function':'function';
      // functions[name] = `${s} ${name}(${params}) {${body}}`;
      x = matchAndExtract(rest, functionPattern);
    }
    return functions;
  }

  // Load and process each file
  for (const filename of filenames) {
    try {
      const response = await fetch(filename);
      const fileContent = await response.text();
      const extractedFunctions = extractFunctions(fileContent);

      // Overwrite functions in the dict with the latest ones from the current file
      for (const [name, func] of Object.entries(extractedFunctions)) {
        functionsDict[name] = func;
      }
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    }
  }

  //console.log('...dict',functionsDict);
  // Sort function names alphabetically and join them into a string
  const sortedFunctionNames = Object.keys(functionsDict).sort();
  const result = sortedFunctionNames
    .map(name => functionsDict[name])
    .join('\n\n');  // Separate functions with an empty line

  return result;
}
async function _loadFunctionsFromFiles(filenames) {
  const functionsDict = {};

  // Helper function to extract function names and their bodies from a file's content
  function extractFunctions(fileContent) {
    const functions = {};

    // Split the content by 'async function' and 'function' (we include async to handle both types)
    const functionSections = fileContent.split(/\bfunction\b|\basync function\b/);

    // Iterate over each split section to extract function names and bodies
    functionSections.forEach(section => {
      section = section.trim();

      if (section) {
        // Find the function signature: name, parameters, and body
        const firstBraceIndex = section.indexOf('{');
        const firstParenIndex = section.indexOf('(');

        if (firstBraceIndex !== -1 && firstParenIndex !== -1) {
          const name = section.substring(0, firstParenIndex).trim().split(' ')[1]; // Function name
          const params = section.substring(firstParenIndex + 1, firstBraceIndex).trim(); // Parameters
          const body = section.substring(firstBraceIndex).trim(); // Function body

          if (name && body) {
            // Add the function to the dictionary, overwriting if it already exists
            functions[name] = `function ${name}(${params}) ${body}`;
          }
        }
      }
    });

    return functions;
  }

  // Load and process each file
  for (const filename of filenames) {
    try {
      const response = await fetch(filename);
      const fileContent = await response.text();
      const extractedFunctions = extractFunctions(fileContent);

      // Overwrite functions in the dict with the latest ones from the current file
      for (const [name, func] of Object.entries(extractedFunctions)) {
        functionsDict[name] = func;
      }
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    }
  }

  // Sort function names alphabetically and join them into a string
  const sortedFunctionNames = Object.keys(functionsDict).sort();
  const result = sortedFunctionNames
    .map(name => functionsDict[name])
    .join('\n\n');  // Separate functions with an empty line

  return result;
}
async function _loadFunctionsFromFiles(filenames) {
  const functionsDict = {};

  // Helper function to extract function names and their bodies from a file's content
  function extractFunctions(fileContent) {
    // Updated regex to handle default parameters and async functions

    //const functionPattern = /async?\s*function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    //const functionPattern = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    //const functionPattern = /async?\s*function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;

    const functionPattern = /(?:async\s*)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{([\s\S]*?)\}/g;

    let match;
    const functions = {};

    while ((match = functionPattern.exec(fileContent)) !== null) {
      const [_, name, params, body] = match;
      console.log('___MATCH!\n', '_', _, '\nname', name, '\nparams', params, '\nbody', body)
      // Handle the function with its default parameters correctly
      let s = _.startsWith('async') ? 'async function' : 'function';
      functions[name] = `${s} ${name}(${params}) {${body}}`;
      fileContent = stringAfter(fileContent, body);
      fileContent = stringAfter(fileContent, '}');
      console.log('===>', fileContent)
    }

    return functions;
  }

  // Load and process each file
  for (const filename of filenames) {
    try {
      const response = await fetch(filename);
      const fileContent = await response.text();
      const extractedFunctions = extractFunctions(fileContent);

      // Overwrite functions in the dict with the latest ones from the current file
      for (const [name, func] of Object.entries(extractedFunctions)) {
        functionsDict[name] = func;
      }
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
    }
  }

  console.log('...dict', functionsDict);
  // Sort function names alphabetically and join them into a string
  const sortedFunctionNames = Object.keys(functionsDict).sort();
  const result = sortedFunctionNames
    .map(name => functionsDict[name])
    .join('\n\n');  // Separate functions with an empty line

  return result;
}
