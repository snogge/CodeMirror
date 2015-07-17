// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Make Highlighting for CodeMirror copyright (c) Ola Nilsson (ola.nilsson@gmail.com)


(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../../addon/mode/simple"), require("../shell/shell"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../../addon/mode/simple", "../shell/shell"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function textstates(start, end, chars) {
    var commonrules = [
      { regex: /#.*/, token: 'comment', pop: true},
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /\$./,  token: 'variable'}
    ];
    var states = {};
    states[start] = Array.from(commonrules);
    states[end] = Array.from(commonrules);
    states[start].push({regex: new RegExp('[^' + chars + ']'), next: end});
    states[end].unshift({ regex: /^/, sol:true, pop: true});
    states[end].push({regex: new RegExp('[^' + chars + ']*$'), pop:true});
    states[end].push({regex: new RegExp('[^' + chars + ']+')});
    return states;
  }

  CodeMirror.defineSimpleMode("make", {
    start: [
      { regex: /#.*/, token: 'comment'},
      /* conditionals */
      { sol: true,
        regex: /(\s*)(ifn?eq)/,
        token: [null, 'keyword'],
        push: 'conditional'
      },
      { sol: true, regex: /(\s*)(else)(\s+)(ifn?eq)/,
        token: [null, 'keyword', null, 'keyword'], push: 'conditional'},
      { sol: true,
        regex: /(\s*)(ifdef)(\s+)([^#=:\s]+)/,
        token: [null, 'keyword', null, 'variable']
      },
      { sol:  true,
        regex: /(\s*)(else)(\s+)(ifdef)(\s+)([^#=:\s]+)/,
        token: [null, 'keyword', null, 'keyword', null, 'variable']
      },
      { sol: true,
        regex: /(\s*)(else|endif)/,
        token: [null, 'keyword']
      },
      // vpath
      { sol: true, regex: /(\s*)(vpath)(\s+)([^\s]+)(\s*)$/,
        token: [null,'builtin',null,'tag',null]},
      { sol: true, regex: /(\s*)(vpath)(\s+)([^\s]+)(\s+)/,
        token: [null,'builtin',null,'tag',null], push: 'text'},
      { sol: true, regex: /(\s*)(vpath)(\s*)$/,
        token: [null,'builtin',null]},
      /* assigment */
      { sol: true,
        regex: /(\s*)(export|override)(\s+)([^#=:\s]+)(\s*)((?:[!?+]|::?)?=)/,
        token: [null, 'keyword', null, 'variable', null, 'operator'],
        push: 'text'
      },
      { sol: true,
        regex: /(\s*)([^#=:\s]+)(\s*)((?:[!?+]|::?)?=)/,
        token: [null, 'variable', null, 'operator'],
        push: 'text'
      },
      // export
      { sol: true, regex: /(\s*)((?:un)?export)/, token: [null, 'keyword'], push: 'text'},
      // undefine
      { sol: true, regex: /(\s*)(undefine)(\s)/, token: [null, 'keyword',null], push: 'text'},
      { sol: true, regex: /(\s*)(override)(\s+)(undefine)(\s*)/,
        token: [null, 'keyword',null,'keyword',null], push: 'text'},
      /* define*/
      { sol: true,
        regex: /(\s*)(define)(\s+)([^#=:\s]+)(\s*)((?:[!?+]|::?)?=)/,
        token: [null, 'keyword', null, 'variable', null, 'operator'],
        push: 'define'
      },
      { sol: true,
        regex: /(\s*)(override)(\s+)(define)(\s+)([^#=:\s]+)(\s*)((?:[!?+]|::?)?=)/,
        token: [null, 'keyword', null, 'keyword', null, 'variable', null, 'operator'],
        push: 'define'
      },
      { sol: true,
        regex: /(\s*)(define)(\s+)([^#=:\s]+)/,
        token: [null, 'keyword', null, 'variable'],
        push: 'define'
      },
      { sol: true,
        regex: /(\s*)(override)(\s+)(define)(\s+)([^#=:\s]+)/,
        token: [null, 'keyword', null, 'keyword', null, 'variable'],
        push: 'define'
      },
      //include
      { sol: true,
        regex: /(\s*-?)(include)(\s+)/,
        token: [null, 'keyword', null],
        push: 'starttext'
      },
      // static pattern target
      { sol:true, regex: /(\s*)(.*?)(\s*)(:)(\s*)(.*?)(\s*)(:)/,
        token: [null, 'def', null, 'operator', null, 'tag', null, 'operator', null],
        push: 'startprereq' },
      // target
      { sol:true, regex: /(\s*)(.*?)(\s*)(::?)(\s*$)/,
        token: [null,'def',null,'operator', null] },
      { sol:true, regex: /(\s*)(.*?)(\s*)(::?)/,
        token: [null,'def',null,'operator'],
        push: 'startprereq' },
      // action
      { sol: true, regex: '(\t\s*)([-+@])', token: [null,'operator'],
        mode: {spec: 'text/x-sh', endeol: true}},
      { sol: true, regex: '\t', token: null,
        mode: {spec: 'text/x-sh', endeol: true}}
    ],
    startprereq: [
      { regex: /(?=;)/, next: 'samelinecmd' },
      { regex: /#.*/, token: 'comment', pop: true},
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /\$./,  token: 'variable'},
      { regex: /\|/, token: 'operator' },
      { regex: /[^#$;|]/, token: null, next: 'prereq'}
    ],
    prereq: [
      { regex: /^/, sol:true, pop: true},
      { regex: /(?=;)/, next: 'samelinecmd'},
      { regex: /#.*/, token: 'comment', pop: true},
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /\$./,  token: 'variable'},
      { regex: /\|/, token: 'operator' },
      { regex: /[^#$;|]*$/, pop: true},
      { regex: /[^#$;|]+/, token: null}
    ],
    samelinecmd: [
      { regex: /;/, token: 'operator',
        mode: {spec: 'text/x-sh', endeol: true} },
      { regex: /^/, pop: true}
    ],
    conditional: [
      /* Lots of room for improvement here....*/
      { regex: /\(\s*.*\s*,\s*.*\s*\)/,
        token: null,
        pop: true
      },
      { regex: /(?:'[^']*'|"[^']*")\s+(?:'[^']*'|"[^']*")/,
        token: null,
        pop: true
      }
    ],
    text: [
      { regex: /^/,       sol:true, pop: true},
      { regex: /#.*/,     token: 'comment', pop: true},
      { regex: /\$\{/,    push: 'curlymacro' },
      { regex: /\$\(/,    push: 'parenmacro' },
      { regex: /\$./,     token: 'variable'},
      { regex: /$/,       pop: true},
      { regex: /[^#$]*$/, pop: true},
      { regex: /[^#$]+/,  token: null}
    ],
    starttext: [
      { regex: /#.*/, token: 'comment', pop: true},
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /\$./,  token: 'variable'},
      { regex: /[^#$]/, token: null, next: 'text'}
    ],
    curlymacro: [
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /(\$)(.)/,  token: [null, 'variable']},
      { regex: /[^}$]+/, token: 'variable'},
      { regex: /\}/, pop: true}
    ],
    parenmacro: [
      { regex: /\$\{/, push: 'curlymacro' },
      { regex: /\$\(/, push: 'parenmacro' },
      { regex: /\$./,  token: 'variable'},
      { regex: /[^)$]+/, token: 'variable'},
      { regex: /\)/, pop: true}
    ],
    define: [
      {sol: true, regex: /(\s*)(endef)/, token: [null, 'keyword'], pop: true},
      {regex: /^/, push: 'starttext'}
    ],
    meta: {
      lineComment: '#'
    }
  });

  CodeMirror.defineMIME("text/x-make", "make");
});

// Local Variables:
// indent-tabs-mode: nil
// js-indent-level: 2
// End:
