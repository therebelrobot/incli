const { omit } = require('lodash');
const yargs = require('yargs');

let log = () => null;
if (process.env.DEBUG === 'incli') { log = console.log; }

const yargOptionInit =  (yargOptions) => (y) => {
  log('Yarg Option initialization', yargOptions)
  const demandOptions = [];
  for (const option of yargOptions) {
    const optionName = option.option;
    if (option.required) { demandOptions.push(optionName); }
    const settings = omit(option, ['option', 'required']);
    y.option(option.option, settings);
  }
  if (demandOptions.length) {
    let demandList = demandOptions;
    let plural = '';
    if (demandList.length > 1) {
      plural = 's';
      demandList[demandList.length - 1] = `and ${demandList[demandList.length - 1]}`;
    }
    demandList = demandList.length > 2 ? demandList.join(', ') : demandList.join(' ');
    const demandOptionMessage = `Please provide the ${demandList} argument${plural} to work with this command`;
    y.demandOption(demandOptions, demandOptionMessage);
  }
};

const yargCallback = (callback) => async (argv) => {
  log('Yarg callback executing', argv)
  try {
    await callback(argv);
  } catch (e) {
    log('Yarg error thrown')
    console.error(e);
    process.exit(1);
  }
}

module.exports = (commands) => {
  log('Yarg command initialization', commands)
  for (const commandName of Object.keys(commands)) {
    const command = commands[commandName];
    yargs.command(commandName, command.description, yargOptionInit(command.options), yargCallback(command.callback));
  }
  yargs.argv;
}
