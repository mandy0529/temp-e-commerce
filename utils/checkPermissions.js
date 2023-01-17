const CustomError = require('../errors');

const checkPermissions = (requestUser, resourceUserId) => {
  // console.log(requestUser, 'user');
  // console.log(resourceUserId, 'user id');
  // console.log(typeof resourceUserId.toString(), 'type user id');

  // admin 계정 일 때 pass
  if (requestUser.role === 'admin') return;

  // 해당 로그인 한 유저id 와 singleUser url에 넣어준 파라미터 id(resourceUserId)가 같을 경우 pass
  if (requestUser.userId === resourceUserId.toString()) return;

  // 이 외에 나머지 조건들은 다 unauthorizederror 날려주기
  throw new CustomError.UnauthorizedError('Not authorized to access this route');
};

module.exports = { checkPermissions };