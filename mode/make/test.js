(function () {
  var mode = CodeMirror.getMode({}, 'make');
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }

  MT("comment",
     "[comment # a several words long comment]",
     "not comment [comment # a several words long comment]");
  
  MT("ifeq_parens",
     "[keyword ifneq] (lhs,rhs)",
     "[keyword ifneq] 'lhs' 'rhs'",
     "[keyword ifneq] 'lhs' \"rhs\"",
     "[keyword ifneq] \"lhs\" 'rhs'",
     "[keyword ifneq] \"lhs\" \"rhs\"",
     "[keyword ifeq] (lhs,rhs)",
     "[keyword ifeq] 'lhs' 'rhs'",
     "[keyword ifeq] 'lhs' \"rhs\"",
     "[keyword ifeq] \"lhs\" 'rhs'",
     "[keyword ifeq] \"lhs\" \"rhs\""
    );

  MT("ifdef",
     "  [keyword ifdef] 	[variable snookums]",
     "  [keyword ifdef] 	[variable snookums_${flibbertigibbet}]"
    );
  
  MT("else_and_endif",
     "[keyword else]",
     "[keyword endif]");

  MT("assignment",
     "[variable name] [operator =] some text or other",
     "[variable name] [operator ?=] some ${[variable text]} or other",
     "[variable @%/] [operator :=] some $([variable text]${[variable frobnic]}) or other",
     "[variable foo_$(bar)] [operator !=] some text or $([variable other])",
     "[variable $(baz)_foo)] [operator ::=] some text or other");

  MT("define",
     "[keyword define] [variable name]",
     "some text or other ${[variable foo]} and some more $([variable text])",
     "even more $([variable text])",
     "$([variable and]) a third line",
     "[keyword endef] [comment # comment]");

  MT("define_op",
     "[keyword define] [variable name] [operator :=] [comment # comment]",
     "some text or other ${[variable foo]} and some more $([variable text])",
     "[keyword endef]");

  MT("include",
     "[keyword include] foo",
     "  [keyword include] foo",
     "-[keyword include] foo",
     "  -[keyword include] foo");

  MT("target",
     "[def foo bar baz] [operator :]",
     "[def foo bar baz] [operator :] [comment # comment]",
     "[def foo bar baz] [operator :] text ${[variable variable]} text",
     "[def foo bar baz] [operator :] text ${[variable variable]} text [comment # comment]");
  MT("simple_rule",
     "[def foo][operator :]",
     "	[builtin echo] foo");
  MT("rule",
     "[def foo bar baz] [operator :]",
     "	[builtin echo] foo bar baz",
     "	[operator -][builtin echo] foo bar baz",
     "	[operator +][builtin echo] foo bar baz",
     "	[operator @][builtin echo] foo bar baz"
    );
  MT("semicolon_target",
     "[def target][operator :] prereq [operator ;] [builtin echo] command",
     "	[builtin echo] another command");
  MT("rule2",
     "[def edit] [operator :] $([variable objects])",
     "	[builtin cc] [attribute -o] edit [quote $(objects)]");
  MT("several_targets",
     "[def main.o] [operator :] defs.h",
     "[def kbd.o] [operator :] defs.h command.h",
     "[def command.o] [operator :] defs.h command.h",
     "[def display.o] [operator :] defs.h buffer.h",
     "[def insert.o] [operator :] defs.h buffer.h",
     "[def search.o] [operator :] defs.h buffer.h",
     "[def files.o] [operator :] defs.h buffer.h command.h",
     "[def utils.o] [operator :] defs.h");
  MT("phony",
     "[def .PHONY] [operator :] clean",
     "[def clean] [operator :]",
     "	[operator -][builtin rm] edit [quote $(objects)]");
  MT("order_prereq",
     "[def TARGETS] [operator :] NORMAL-PREREQUISITES [operator |] ORDER-ONLY-PREREQUISITES");
     
  MT("vpath",
     "[builtin vpath] %.h ../headers",
     "[builtin vpath] %.h",
     "[builtin vpath]");

  MT("static_pattern",
     "[def bigoutput littleoutput] [operator :] %output [operator :] text.g",
     "	generate text.g -$* > $@");
  MT("double_colon",
     "[def target][operator ::] prereq");
  MT("export",
     "[keyword export] [variable foo] = ${[variable bar]}",
     "[keyword export] [variable baz]",
     "[keyword export]");
})();
