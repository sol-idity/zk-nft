export function getDelegateRoleFromNumber(num: number): any {
  switch (num) {
    case 0:
      return { none: {} };
    case 1:
      return { all: {} };
    case 2:
      return { transfer: {} };
    case 3:
      return { lock: {} };
    case 4:
      return { burn: {} };
    case 5:
      return { transferAndLock: {} };
    case 6:
      return { transferAndBurn: {} };
    case 7:
      return { lockAndBurn: {} };
  }
}

export function getBaseDataStateFromNumber(num: number): any {
  switch (num) {
    case 0:
      return { unlocked: {} };
    case 1:
      return { lockedByAuthority: {} };
    case 2:
      return { lockedByDelegate: {} };
  }
}
