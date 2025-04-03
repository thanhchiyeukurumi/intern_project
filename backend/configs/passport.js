const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const db = require('models');
const jwtConfig = require('configs/jwt');
const hash = require('kernels/hash');

// Cấu hình các chiến lược xác thực

// JWT strategy
const jwtOptions = {
  // Lấy token từ header Authorization  
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Sử dụng secret key để giải mã token
  secretOrKey: jwtConfig.secret
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    // Tìm người dùng theo ID trong JWT payload
    const user = await db.User.findByPk(jwtPayload.id, {
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });

    if (!user) {
      return done(null, false);
    }

    // Loại bỏ password từ user object
    const userObj = user.toJSON();
    delete userObj.password;

    return done(null, userObj);
  }

  catch (error) {
    return done(error, false);
  }
}));

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Tìm người dùng theo email của Google
    let user = await db.User.findOne({
      where: { email: profile.emails[0].value },
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });

    // Nếu không tìm thấy, tạo người dùng mới
    if (!user) {
      // Lấy vai trò 'user' mặc định
      const userRole = await db.Role.findOne({ where: { name: 'user' } });

      // Tạo tên đăng nhập từ email, loại bỏ các ký tự đặc biệt
      const username = profile.emails[0].value.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

      // Tạo mật khẩu ngẫu nhiên sử dụng kernels/hash
      const randomPassword = Math.random().toString(36).slice(-16);
      const hashedPassword = await hash.make(randomPassword);

      user = await db.User.create({
        username: username,
        fullname: profile.displayName || username,
        email: profile.emails[0].value,
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        password: hashedPassword,
        description: '',
        role_id: userRole.id
      });

      // Tải lại user với role
      user = await db.User.findByPk(user.id, {
        include: [{
          model: db.Role,
          as: 'role'
        }]
      });
    }

    // Loại bỏ password từ user object
    const userObj = user.toJSON();
    delete userObj.password;

    return done(null, userObj);
  } catch (error) {
    return done(error, false);
  }
}));

// // GitHub OAuth strategy
// passport.use(new GithubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: process.env.GITHUB_CALLBACK_URL,
//   scope: ['user:email'],
//   passReqToCallback: true
// }, async (req, accessToken, refreshToken, profile, done) => {
//   try {
//     // Lấy email chính của GitHub
//     const primaryEmail = profile.emails && profile.emails.length > 0
//       ? profile.emails.find(email => email.primary)?.value || profile.emails[0].value
//       : `${profile.username}@github.com`; // Fallback if no email available

//     // Tìm người dùng theo email
//     let user = await db.User.findOne({
//       where: { email: primaryEmail },
//       include: [{
//         model: db.Role,
//         as: 'role'
//       }]
//     });

//     // Nếu không tìm thấy, tạo người dùng mới
//     if (!user) {
//       // Lấy vai trò 'user' mặc định
//       const userRole = await db.Role.findOne({ where: { name: 'user' } });

//       // Tạo mật khẩu ngẫu nhiên sử dụng kernels/hash
//       const randomPassword = Math.random().toString(36).slice(-16);
//       const hashedPassword = await hash.make(randomPassword);

//       user = await db.User.create({
//         username: profile.username || primaryEmail.split('@')[0],
//         fullname: profile.displayName || profile.username,
//         email: primaryEmail,
//         avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
//         password: hashedPassword,
//         description: profile.bio || '',
//         role_id: userRole.id
//       });

//       // Tải lại user với role
//       user = await db.User.findByPk(user.id, {
//         include: [{
//           model: db.Role,
//           as: 'role'
//         }]
//       });
//     }

//     // Loại bỏ password từ user object
//     const userObj = user.toJSON();
//     delete userObj.password;

//     return done(null, userObj);
//   } catch (error) {
//     return done(error, false);
//   }
// }));

// Serialize và deserialize user cho session (nếu sử dụng)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id, {
      include: [{
        model: db.Role,
        as: 'role'
      }]
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 