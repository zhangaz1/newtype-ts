import * as assert from 'assert'
import { Newtype, iso, getMonoid, getRing, getOrd, getSemigroup, getEq, getSemiring, getField, prism } from '../src'
import { monoidSum, fold } from 'fp-ts/lib/Monoid'
import * as S from 'fp-ts/lib/Semigroup'
import { fieldNumber } from 'fp-ts/lib/Field'
import { Lens } from 'monocle-ts/lib'
import { ordNumber, lt } from 'fp-ts/lib/Ord'
import { eqNumber } from 'fp-ts/lib/Eq'
import { some, none } from 'fp-ts/lib/Option'

type Label = Newtype<'Label', string>
const label = iso<Label>()

type Real = Newtype<'Real', number>
const real = iso<Real>()

type Age = Newtype<'Age', number>
const age = iso<Age>()

type Person = {
  name: string
  age: Age
}

describe('iso', () => {
  it('should not change the runtime representation', () => {
    assert.strictEqual(label.wrap('foo'), 'foo')
  })

  it('should allow mappings', () => {
    assert.strictEqual(label.modify(s => s + '!')(label.wrap('foo')), 'foo!')
  })

  it('should allow optic management', () => {
    const person: Person = {
      name: 'Giulio',
      age: age.wrap(43)
    }
    const ageLens = Lens.fromProp<Person>()('age').compose(age.asLens())
    assert.deepEqual(ageLens.set(44)(person), {
      name: 'Giulio',
      age: 44
    })
  })
})

describe('Algebras', () => {
  it('getSetoid', () => {
    const eqReal = getEq<Real>(eqNumber)
    assert.strictEqual(eqReal.equals(real.wrap(2), real.wrap(2)), true)
    assert.strictEqual(eqReal.equals(real.wrap(2), real.wrap(3)), false)
    assert.strictEqual(eqReal.equals(real.wrap(3), real.wrap(2)), false)
  })

  it('getOrd', () => {
    const ordReal = getOrd<Real>(ordNumber)
    assert.strictEqual(lt(ordReal)(real.wrap(2), real.wrap(3)), true)
    assert.strictEqual(lt(ordReal)(real.wrap(3), real.wrap(3)), false)
  })

  it('getSemigroup', () => {
    const semigroupReal = getSemigroup<Real>(monoidSum)
    assert.strictEqual(S.fold(semigroupReal)(real.wrap(0), [real.wrap(2), real.wrap(3)]), 5)
  })

  it('getMonoid', () => {
    const monoidReal = getMonoid<Real>(monoidSum)
    assert.strictEqual(fold(monoidReal)([real.wrap(2), real.wrap(3)]), 5)
  })

  it('getSemiring', () => {
    const semiringReal = getSemiring<Real>(fieldNumber)
    assert.strictEqual(semiringReal.mul(real.wrap(2), real.wrap(3)), 6)
  })

  it('getRing', () => {
    const ringReal = getRing<Real>(fieldNumber)
    assert.strictEqual(ringReal.mul(real.wrap(2), real.wrap(3)), 6)
  })

  it('getField', () => {
    const fieldReal = getField<Real>(fieldNumber)
    assert.strictEqual(fieldReal.mul(real.wrap(2), real.wrap(3)), 6)
  })
})

describe('prism', () => {
  it('should return an Option', () => {
    interface Integer extends Newtype<{ readonly Integer: unique symbol }, number> {}
    const prismInteger = prism<Integer>(n => n % 1 === 0)
    assert.deepEqual(prismInteger.getOption(1), some(1))
    assert.deepEqual(prismInteger.getOption(0.5), none)
  })
})
