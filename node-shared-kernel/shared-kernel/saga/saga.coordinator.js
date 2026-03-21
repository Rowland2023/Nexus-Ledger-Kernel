// /shared/services/sagaExecutor.js
export async function executeSaga(saga, context, handlers) {
  const executedSteps = [];
  try {
    for (const step of saga.steps) {
      await handlers[step.name](context);
      executedSteps.push(step);
    }
  } catch (err) {
    // rollback executed steps in reverse order
    for (const step of executedSteps.reverse()) {
      if (handlers[step.compensation]) {
        await handlers[step.compensation](context);
      }
    }
    throw err;
  }
}
